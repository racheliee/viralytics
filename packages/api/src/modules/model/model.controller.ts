import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InstagramCookieGuard } from 'src/modules/auth/guards/instagram-cookie.guard';

@Controller('model')
@UseGuards(InstagramCookieGuard)
export class ModelController {
    @Post('vitr')
    async evaluateVitr(
        @Body() body: { files: string[] }
    ): Promise<string> {
        if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
            throw new Error('No files provided for evaluation');
        }

        // Mock evaluation logic
        await new Promise((resolve) => setTimeout(resolve, 300));

        return "IMG_3187.JPG";
    }
}
