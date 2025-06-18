import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Controller('images')
export class ImagesController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB in bytes
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPEG, JPG, and PNG files are allowed!',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const originalPath = file.path;
    const originalExt = extname(originalPath).toLowerCase();
    const jpegFilename = `${Date.now()}.jpg`;
    const jpegPath = join('./uploads/images', jpegFilename);

    try {
      if (originalExt !== '.jpeg') {
        await sharp(originalPath).jpeg().toFile(jpegPath);
      }

      // Always remove the original file
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }

      return {
        message: 'Image saved as JPEG',
        filename: jpegFilename,
        url: `/uploads/images/${jpegFilename}`,
      };
    } catch (error) {
      return {
        message: 'Error processing image',
        error: error.message,
      };
    }
  }
}
