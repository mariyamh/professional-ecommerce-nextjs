import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingSku = await this.findBySku(createProductDto.sku);
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    const existingSlug = await this.findBySlug(createProductDto.slug);
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.productsRepository.findOne({ where: { slug } });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productsRepository.findOne({ where: { sku } });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { category, isActive: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    product.isActive = false;
    await this.productsRepository.save(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    product.stock -= quantity;
    if (product.stock < 0) {
      throw new ConflictException('Insufficient stock');
    }
    return await this.productsRepository.save(product);
  }
}
