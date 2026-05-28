import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminRequestStatus, Prisma, User, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);
    if (dto.role === UserRole.ADMIN) {
      await this.usersService.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.ADMIN,
        adminRequestStatus: AdminRequestStatus.PENDING,
        adminRequestRequestedAt: new Date(),
      });

      return {
        requiresApproval: true as const,
        message: 'Your request to become an admin is being processed.',
      };
    }

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.STUDENT,
    });

    return this.buildAuthResponse(user, {});
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === UserRole.ADMIN && user.adminRequestStatus === AdminRequestStatus.PENDING) {
      throw new UnauthorizedException('Your admin access request is still being processed.');
    }

    if (user.role === UserRole.ADMIN && user.adminRequestStatus === AdminRequestStatus.REJECTED) {
      throw new UnauthorizedException('Your admin access request was not approved.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.buildAuthResponse(user, {
      deviceId: dto.deviceId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      updateLastLogin: true,
    });
  }

  async refresh(refreshToken: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const session = await this.findMatchingSession(sessions, refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResponse(user, {
      deviceId: session.deviceId ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
    });
  }

  async logout(refreshToken: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const session = await this.findMatchingSession(sessions, refreshToken);
    if (session) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }

    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    const response: {
      message: string;
      resetToken?: string;
      resetUrl?: string;
    } = {
      message: 'If an account exists for this email, we’ve sent a password reset link.',
    };

    if (!user || !user.isActive) {
      return response;
    }

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        purpose: 'password-reset',
      },
      {
        secret: this.configService.get<string>('app.jwtResetSecret'),
        expiresIn: this.configService.get<string>('app.jwtResetTtl'),
      },
    );

    // TODO: Replace this development response with a real email delivery integration.
    response.resetToken = resetToken;
    response.resetUrl = `${this.configService.get<string>('app.appUrl')}/reset-password?token=${encodeURIComponent(resetToken)}`;

    return response;
  }

  async resetPassword(token: string, password: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtUser & { purpose?: string }>(token, {
        secret: this.configService.get<string>('app.jwtResetSecret'),
      });

      if (payload.purpose !== 'password-reset') {
        throw new BadRequestException('This reset link is invalid.');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('This reset link is invalid.');
      }

      const passwordHash = await argon2.hash(password);
      await this.usersService.updateById(user.id, { passwordHash });
      await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      return {
        message: 'Your password has been reset successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('This reset link is invalid or has expired.');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...profile } = user;
    return profile;
  }

  private async buildAuthResponse(
    user: Pick<User, 'id' | 'email' | 'role' | 'firstName' | 'lastName'>,
    options: {
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
      updateLastLogin?: boolean;
    },
  ) {
    const payload: JwtUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwtAccessSecret'),
      expiresIn: this.configService.get<string>('app.jwtAccessTtl'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwtRefreshSecret'),
      expiresIn: this.configService.get<string>('app.jwtRefreshTtl'),
    });

    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTtl = this.configService.get<string>('app.jwtRefreshTtl', '7d');
    const expiresAt = new Date(Date.now() + this.parseDurationToMs(refreshTtl));

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: refreshTokenHash,
        ipAddress: options.ipAddress,
        deviceId: options.deviceId,
        userAgent: options.userAgent,
        expiresAt,
      },
    });

    if (options.updateLastLogin) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async findMatchingSession(
    sessions: Prisma.UserSessionGetPayload<Record<string, never>>[],
    refreshToken: string,
  ) {
    for (const session of sessions) {
      if (await argon2.verify(session.refreshToken, refreshToken)) {
        return session;
      }
    }

    return null;
  }

  private parseDurationToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multiplier: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * multiplier[unit];
  }
}
