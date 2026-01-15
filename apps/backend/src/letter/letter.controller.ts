import { Controller, Get, Body, Post, Param, Put } from '@nestjs/common';
import { LetterService, OpenAIResponse } from './letter.service';
import { GetImageDto } from './dto/get-image.dto';
import { GetLettersDto } from './dto/get-letters.dto';
import { SendImagesDto } from './dto/send-images.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}
  
  @Post('/letter')
  getImageLetter(@Body() body: GetImageDto) {
    return this.letterService.getImageLetter(body);
  }

  @Post('/letters')
  getLetters(@Body() body: GetLettersDto): {
    letters: Array<{ id: number; letter: string; language: string }>;
  } {
    return this.letterService.getLetters(body);
  }

  @Post('/sendImages')
  sendImages(
    @Body() body: SendImagesDto,
  ): Promise<{
    percents: number;
    result: OpenAIResponse;
  }> {
    return this.letterService.sendTwoImages(body);
  }

  @Get('/getUserProgress/')
  getUserProgress() {
    // Return empty progress since we're not using database for progress anymore
    return { progress: {} };
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
