import { Module } from '@nestjs/common';
import { FlutterKeyService } from './flutter_key.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FlutterKeyController } from './flutter_key.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [FlutterKeyController],
  providers: [FlutterKeyService, PrismaService, JwtService],
  exports: [FlutterKeyService],
})
export class FlutterKeyModule {}
