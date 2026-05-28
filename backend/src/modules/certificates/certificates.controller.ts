import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { ListStudentCertificatesQueryDto } from './dto/list-student-certificates-query.dto';
import { Response } from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  listStudentCertificates(
    @CurrentUser() user: JwtUser,
    @Query() query: ListStudentCertificatesQueryDto,
  ) {
    return this.certificatesService.listStudentCertificates(user.sub, query);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getStudentCertificate(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.certificatesService.getStudentCertificateDetail(user.sub, id);
  }

  @Get('me/:id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async downloadStudentCertificate(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const asset = await this.certificatesService.getStudentCertificateDownload(user.sub, id);
    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${asset.fileName}"`);
    res.send(asset.content);
  }

  @Get('verify/:certificateNumber')
  verify(@Param('certificateNumber') certificateNumber: string) {
    return this.certificatesService.verifyCertificate(certificateNumber);
  }
}
