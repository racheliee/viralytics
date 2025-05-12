import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

export class MetaCallbackRequestDto {
  @IsString()
  @IsNotEmpty()
  code: string
}
