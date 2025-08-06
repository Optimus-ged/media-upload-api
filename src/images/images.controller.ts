import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
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
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  @Post()
  @ApiOperation({
    summary: 'Upload an image file to the backend',
    description:
      'Only JPEG, JPG, and PNG files are allowed. Maximum size: 1 GB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload form',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
          console.warn(
            `Rejected file: ${file.originalname}, ext: ${ext}, mimetype: ${mimetype}`,
          );
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
  async uploadFile(@UploadedFile('file') file: Express.Multer.File) {
    const originalPath = file.path;
    // const originalExt = extname(originalPath).toLowerCase();
    const jpegFilename = `${Date.now()}.jpg`;
    const jpegPath = join('./uploads/images', jpegFilename);

    try {
      // Always convert to .jpg using sharp
      await sharp(originalPath).jpeg().toFile(jpegPath);

      // Always remove the original file
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }

      return { imgName: jpegFilename };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({
    summary: 'This API displays a list of all the image files',
  })
  @Get()
  getAllImages() {
    const folderPath = path.join(__dirname, '..', '..', 'uploads', 'images');

    try {
      const files = fs.readdirSync(folderPath);

      // Optional: filter image extensions
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png)$/i.test(file),
      );

      // Return just names, or build full URLs if you serve them statically
      return imageFiles;
    } catch (error) {
      return {
        message: 'Error reading image directory',
        error: error.message,
      };
    }
  }
}
