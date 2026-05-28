import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { ProctoringModule } from '../proctoring/proctoring.module';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';

@Module({
  imports: [ProctoringModule, CertificatesModule, AiModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
