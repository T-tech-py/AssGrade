import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { AiService } from './ai.service';
import { GenerateAiArtifactDto } from './dto/generate-ai-artifact.dto';
import { GeneratePracticeSessionDto } from './dto/generate-practice-session.dto';
import {
  PracticeQuestionFeedbackDto,
  ReviewPracticeSessionDto,
} from './dto/review-practice-session.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  generate(@CurrentUser() user: JwtUser, @Body() dto: GenerateAiArtifactDto) {
    return this.aiService.generateArtifact(user.sub, dto);
  }

  @Get('practice/bootstrap')
  getPracticeBootstrap(@CurrentUser() user: JwtUser) {
    return this.aiService.getPracticeBootstrap(user.sub);
  }

  @Post('practice/session')
  generatePracticeSession(@CurrentUser() user: JwtUser, @Body() dto: GeneratePracticeSessionDto) {
    return this.aiService.generatePracticeSession(user.sub, dto);
  }

  @Get('practice/session/:sessionId')
  getPracticeSession(@CurrentUser() user: JwtUser, @Param('sessionId') sessionId: string) {
    return this.aiService.getPracticeSession(user.sub, sessionId);
  }

  @Post('practice/question-feedback')
  getPracticeQuestionFeedback(
    @CurrentUser() user: JwtUser,
    @Body() dto: PracticeQuestionFeedbackDto,
  ) {
    return this.aiService.getPracticeQuestionFeedback(user.sub, dto);
  }

  @Post('practice/review')
  reviewPracticeSession(@CurrentUser() user: JwtUser, @Body() dto: ReviewPracticeSessionDto) {
    return this.aiService.reviewPracticeSession(user.sub, dto);
  }

  @Get('practice/review/:reviewId')
  getPracticeReview(@CurrentUser() user: JwtUser, @Param('reviewId') reviewId: string) {
    return this.aiService.getPracticeReview(user.sub, reviewId);
  }
}
