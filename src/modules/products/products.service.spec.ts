import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct: Product = {
    id: '1',
    name: 'iPhone 15',
    slug: 'iphone-15',
    sku: 'SKU-001',
    description: 'Latest iPhone',
    price: 999.99,
    stock: 50,
    category: 'ELECTRONICS',
    images: ['image1.jpg'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'iPhone 15',
        slug: 'iphone-15',
        sku: 'SKU-001',
        description: 'Latest iPhone',
        price: 999.99,
        stock: 50,
        category: 'ELECTRONICS',
      });

      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException if SKU exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      await expect(
        service.create({
          name: 'iPhone 15',
          slug: 'iphone-15',
          sku: 'SKU-001',
          description: 'Latest iPhone',
          price: 999.99,
          stock: 50,
          category: 'ELECTRONICS',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue({ ...mockProduct, stock: 45 });

      const result = await service.updateStock('1', 5);

      expect(result.stock).toBe(45);
    });

    it('should throw ConflictException if insufficient stock', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, stock: 5 });

      await expect(service.updateStock('1', 10)).rejects.toThrow(ConflictException);
    });
  });
});
