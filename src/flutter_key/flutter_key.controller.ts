import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FlutterKeyService } from './flutter_key.service';
import { AdminGuard } from 'src/guards';
import {
  CreateFlutterKeyDto,
  UpdateFlutterKeyDto,
} from './dtos/flutter-key.dto';

@Controller('flutter-key')
@UseGuards(AdminGuard)
export class FlutterKeyController {
  constructor(private readonly flutterKeyService: FlutterKeyService) {}

  @Get()
  async getAllFlutterKeys() {
    return this.flutterKeyService.getAllFlutterKeys();
  }

  @Get(':id')
  async getFlutterKeyById(@Param('id') id: string) {
    return this.flutterKeyService.getFlutterKeyById(id);
  }

  @Post()
  async createFlutterKey(@Body() createFlutterKeyDto: CreateFlutterKeyDto) {
    return this.flutterKeyService.createFlutterKey(createFlutterKeyDto);
  }

  @Put(':id')
  async updateFlutterKey(
    @Param('id') id: string,
    @Body() updateFlutterKeyDto: UpdateFlutterKeyDto,
  ) {
    return this.flutterKeyService.updateFlutterKey(id, updateFlutterKeyDto);
  }

  @Delete(':id')
  async deleteFlutterKey(@Param('id') id: string) {
    return this.flutterKeyService.deleteFlutterKey(id);
  }
}
