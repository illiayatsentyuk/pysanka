import { BadRequestException, Injectable } from '@nestjs/common';
import { dummyLetters as dummyEnLetters } from './dictionaries/dummy-en-letters';
import { dummyLetters as dummyUaLetters } from './dictionaries/dummy-ua-letters';
import { dummyLetters as dummyJpLetters } from './dictionaries/dummy-jp-letters';
import { GetImageDto } from './dto/get-image.dto';
import { GetLettersDto } from './dto/get-letters.dto';
import * as path from 'path';
import * as fs from 'fs';
import { SendImagesDto } from './dto/send-images.dto';
import { User } from 'src/users/user.entity';
import { OpenAI } from 'openai';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ConfigService } from '@nestjs/config';

interface Letter {
  id: number;
  letter: string;
  language: string;
}

interface LetterStatus {
  status: 'bad' | 'average' | 'good';
}

interface LanguageResults {
  [letter: string]: LetterStatus;
}

interface UserResults {
  [language: string]: LanguageResults;
}

export interface OpenAIResponse {
  percents: number;
  advice?: string;
  letter?: string;
  difference?: string;
  description?: string;
}

interface OpenAIResponseObject {
  output_text: string;
}

interface OpenAIResponses {
  create(params: {
    model: string;
    input: Array<{ role: string; content: unknown }>;
  }): Promise<OpenAIResponseObject>;
}

interface CustomOpenAIClient {
  responses: OpenAIResponses;
}

@Injectable()
export class LetterService {
  private openai: CustomOpenAIClient;
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    }) as unknown as CustomOpenAIClient;
  }
  private normalizeToDataUrl(image: string): string {
    if (!image) return image;
    const trimmed = image.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
      return trimmed;
    if (trimmed.startsWith('data:')) return trimmed;
    const mime = this.guessMimeFromBase64(trimmed);
    return `data:${mime};base64,${trimmed}`;
  }

  private guessMimeFromBase64(b64: string): string {
    const prefix = b64.slice(0, 10);
    if (prefix.startsWith('iVBORw0KG')) return 'image/png'; // PNG
    if (prefix.startsWith('/9j/')) return 'image/jpeg'; // JPEG
    if (prefix.startsWith('R0lGOD')) return 'image/gif'; // GIF
    if (prefix.startsWith('UklGR')) return 'image/webp'; // WEBP
    if (prefix.startsWith('PHN2Zy')) return 'image/svg+xml'; // SVG (base64-encoded)
    return 'image/png';
  }
  getImageLetter(body: GetImageDto) {
    const selectedLetter = body.letter.toUpperCase();
    const selectedLanguage = body.language;
    try {
      let letters: Letter[];
      if (selectedLanguage === 'en') {
        letters = dummyEnLetters;
      } else if (selectedLanguage === 'ua') {
        letters = dummyUaLetters;
      } else if (selectedLanguage === 'jp') {
        letters = dummyJpLetters;
      } else {
        throw new BadRequestException('Language is incorrect');
      }

      const currentIndex = letters.findIndex(
        (l) => l.letter === selectedLetter,
      );
      if (currentIndex === -1) {
        throw new BadRequestException('Letter is incorrect');
      }

      const prevIndex =
        currentIndex === 0 ? letters.length - 1 : currentIndex - 1;

      const nextIndex =
        currentIndex === letters.length - 1 ? 0 : currentIndex + 1;

      const prevLetter = letters[prevIndex].letter;
      const nextLetter = letters[nextIndex].letter;

      const imagePath = path.join(
        __dirname,
        '..',
        '..',
        'lang',
        selectedLanguage,
        `letter-${selectedLetter}.svg`,
      );
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString('base64');

      return {
        image: base64,
        nextLetter,
        prevLetter,
      };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }
  getLetters(body: GetLettersDto) {
    const selectedLanguage = body.language;
    try {
      let letters: Letter[];
      if (selectedLanguage === 'en') {
        letters = dummyEnLetters;
      } else if (selectedLanguage === 'ua') {
        letters = dummyUaLetters;
      } else if (selectedLanguage === 'jp') {
        letters = dummyJpLetters;
      } else {
        throw new BadRequestException('Language is incorrect');
      }

      return { letters: letters };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }

  async sendTwoImages(body: SendImagesDto) {
    const { userImage, ethalonImage, letter, language, systemLanguage } = body;
    const normalizedUserImage = this.normalizeToDataUrl(userImage);
    const normalizedEthalonImage = this.normalizeToDataUrl(ethalonImage);

    const contents: any[] = [
      {
        type: 'input_image',
        image_url: normalizedUserImage,
      },
      {
        type: 'input_image',
        image_url: normalizedEthalonImage,
      },
      {
        type: 'input_text',
        text: `
                You will receive two pictures. Each may or may not contain a single handwritten letter. 
                In the second picture is letter: ${letter}.
                
                Step 1: Detect the letter in the first image. If no letter is present, write "no letter" in the "letter" field.
                
                Step 2: Detect the letter in the second image ("correct"). If no letter is present, treat it as missing.
                
                Step 3: If one of the images has no letter, set "percents" to 0 and explain in "difference" and "description".
                
                Step 4: If both images have letters, compare them:
                - If the letters are different characters (e.g., 'Ґ' vs 'Г'), set "percents" to 0 and explain the mismatch.
                - If the letters are the same character but differ in style (e.g., cursive vs print), calculate similarity based on shape and style. Set "percents" accordingly (e.g., 60–90).
                - Suggest **ways the user can improve their handwriting** for that specific letter (e.g., “try to close the top loop” or “practice the curve in the lower part”).
        
                
                Special notes:
                - Handwritten Ukrainian letters such as "Ґ", "Ї", "Є", or stylized versions of them may resemble mathematical symbols like ∫ or ƒ — always interpret based on full shape and national writing style. Do not confuse stylized Ukrainian letters with unrelated symbols.
                - Use only letters from the passed language. If the character appears to be from a different script or a symbol, and the intended letter is unclear, return "no letter" and start sentence 'On this image'.
                
                ⚠️ **IF** "letter" is "none" **AND** "language" is "none":
                - Ignore all letter detection and language-specific rules.
                - Simply compare the visual similarity of the two images (shapes, strokes, style).
                - Return only the similarity percentage.
                
                - Give answers in ${systemLanguage}
                Language: ${language}
                
                Respond in JSON format:
                
                If "letter" and "language" are not "none":
                json
                    {
                      "percents": number,
                      "advice":string,
                      "letter": string,
                      "difference": string,
                      "description": string
                    }
                
                    `,
      },
    ];

    try {
      const response: OpenAIResponseObject = await this.openai.responses.create(
        {
          model: 'gpt-4.1',
          input: [
            {
              role: 'user',
              content: contents,
            },
          ],
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resul: OpenAIResponse = JSON.parse(response.output_text);
      const percents: number = resul.percents;

      // Progress is now stored in localStorage on the frontend
      // No need to save to database
      return {
        percents: percents,
        result: resul,
      };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }

  async getUser(userId: number) {
    try {
      const user: User | null = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return { user: user };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }

  async getUserProgress(userId: number) {
    try {
      const user: User | null = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return {
        progress: user.results,
      };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }
  async updateUserProgress(userId: number, body: UpdateProgressDto) {
    const { letter, status, language } = body;
    try {
      const user: User | null = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      if (!user.results) {
        user.results = {} as UserResults;
      }
      if (!user.results[language]) {
        user.results[language] = {} as LanguageResults;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      user.results[language][letter] = { status: status };
      const savedUser: User = await this.userRepo.save(user);
      return {
        user: savedUser,
      };
    } catch (e) {
      console.log(e);
      const error = e as Error;
      throw new BadRequestException(error.message);
    }
  }
}
