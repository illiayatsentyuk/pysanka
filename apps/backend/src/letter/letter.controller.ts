import { Controller, Get, Body, Post, Param, Put } from '@nestjs/common';
import { LetterService, OpenAIResponse } from './letter.service';
import { GetImageDto } from './dto/get-image.dto';
import { GetLettersDto } from './dto/get-letters.dto';
import { SendImagesDto } from './dto/send-images.dto';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}
  @Public()
  @Post('/letter')
  getImageLetter(@Body() body: GetImageDto) {
    return this.letterService.getImageLetter(body);
  }

  @Public()
  @Post('/letters')
  getLetters(@Body() body: GetLettersDto): {
    letters: Array<{ id: number; letter: string; language: string }>;
  } {
    return this.letterService.getLetters(body);
  }

  @Post('/sendImages')
  sendImages(
    @Body() body: SendImagesDto,
    @GetCurrentUserId() userId: number,
  ): Promise<{
    percents: number;
    result: OpenAIResponse;
    updatedResults: any;
  }> {
    return this.letterService.sendTwoImages(body, userId);
  }

  @Get('/getUserProgress/')
  getUserProgress(@GetCurrentUserId() userId: number) {
    return this.letterService.getUserProgress(userId);
  }

  @Get('/getUser/:id')
  getUser(@Param('id') id: number) {
    return this.letterService.getUser(id);
  }

  @Put('/updateUserProgress/:id')
  updateUserProgress(@Param('id') id: number, @Body() body: UpdateProgressDto) {
    return this.letterService.updateUserProgress(id, body);
  }
}
