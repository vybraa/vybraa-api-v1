import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from 'src/types/category';
import { CategoryDto } from '../dtos/CategoryDto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(category: CategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: category,
    });
  }

  async findById(id: string): Promise<Category> {
    return this.prisma.category.findUnique({
      where: { id },
      include: { celebrityProfile: true },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async updateCategory(id: string, category: CategoryDto): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: category,
    });
  }
}
