import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ReqWithInstagram } from 'src/modules/auth/decorator/instagram-auth-decorator'
import { InstagramCookieGuard } from 'src/modules/auth/guards/instagram-cookie.guard'
import { LLM_RESPONSE } from 'src/modules/model/constants/response'
import {
  LikePredictorRequestDto,
  LikePredictorResponseDto
} from 'src/modules/model/dto/like-predictor.dto'

@Controller('model')
@UseGuards(InstagramCookieGuard)
export class ModelController {
  @Post('vitr')
  async evaluateVitr(@Body() body: { files: string[] }): Promise<string> {
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      throw new Error('No files provided for evaluation')
    }

    // Mock evaluation logic
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return 'IMG_3187.JPG'
  }

  @Post('like-predictor')
  async runLikePredictor(
    @ReqWithInstagram() req: { token: string; userId: string },
    @Body() body: LikePredictorRequestDto
  ): Promise<LikePredictorResponseDto> {
    if (body.fileNum === 0) {
      throw new Error('No files provided for like prediction')
    }

    // Mock prediction logic
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return {
      likes: Math.floor(Math.random() * 80) + 170, // predict between 170 and 250 likes
      llmResponse: LLM_RESPONSE
    }
  }
}
