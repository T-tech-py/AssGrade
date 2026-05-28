import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProctorEventDto } from './dto/proctor-event.dto';

@Injectable()
export class ProctoringService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(attemptId: string, dto: ProctorEventDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const event = await this.prisma.proctorEvent.create({
      data: {
        attemptId,
        type: dto.type,
        severity: dto.severity ?? 1,
        payload: dto.payload as Prisma.InputJsonValue | undefined,
      },
    });

    const updateData: {
      tabSwitchCount?: { increment: number };
      fullscreenViolations?: { increment: number };
      suspiciousFlags?: { increment: number };
    } = {};

    if (dto.type === 'TAB_SWITCH') {
      updateData.tabSwitchCount = { increment: 1 };
    }
    if (dto.type === 'FULLSCREEN_EXIT') {
      updateData.fullscreenViolations = { increment: 1 };
    }
    if (dto.severity && dto.severity >= 2) {
      updateData.suspiciousFlags = { increment: 1 };
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: updateData,
      });
    }

    return event;
  }
}
