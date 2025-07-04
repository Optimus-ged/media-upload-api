import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  @Post()
  @ApiOperation({
    summary: 'Upload a document file to the backend',
    description: 'Only PDF',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Documents upload form',
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
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase(); // e.g., '.pdf'
          const uniqueName = `${Date.now()}${ext}`; // adds .pdf
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB in bytes
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile('file') file: Express.Multer.File) {
    try {
      return { docName: file.filename };
    } catch (error) {
      return {
        message: 'Error processing document',
        error: error.message,
      };
    }
  }

  @ApiOperation({
    summary: 'This API displays a list of all the documents',
  })
  @Get()
  get() {
    const folderPath = path.join(__dirname, '..', '..', 'uploads', 'documents');

    try {
      const files = fs.readdirSync(folderPath);
      return files;
    } catch (error) {
      return {
        message: 'Error reading image directory',
        error: error.message,
      };
    }
  }
}
