import { IsISO8601, IsNumber, IsString } from 'class-validator'

export class LikePredictorRequestDto {
  @IsNumber()
  fileNum: number

  @IsISO8601()
  date: string
}

export class LikePredictorResponseDto {
  @IsNumber()
  likes: number

  @IsString()
  llmResponse: string
}
