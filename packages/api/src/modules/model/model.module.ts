import { Module } from '@nestjs/common';
import { ModelController } from './model.controller';

@Module({
  controllers: [ModelController]
})
export class ModelModule {}
