import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Category } from 'src/types/category';
import { Admin, Public } from 'src/decorators';
import { CategoryDto } from '../dtos/CategoryDto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Admin()
  async createCategory(@Body() category: CategoryDto): Promise<Category> {
    return this.categoryService.createCategory(category);
  }

  @Get(':id')
  @Admin()
  async findById(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findById(id);
  }

  @Get()
  @Public()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Put(':id')
  @Admin()
  async updateCategory(
    @Param('id') id: string,
    @Body() category: CategoryDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, category);
  }
}
