import { Module } from '@nestjs/common';
import { ProctoringGateway } from './proctoring.gateway';
import { ProctoringService } from './proctoring.service';

@Module({
  providers: [ProctoringService, ProctoringGateway],
  exports: [ProctoringService],
})
export class ProctoringModule {}
