import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums";
import { S3Service } from "../aws/s3.service";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create product (Admin only)" })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post("upload-image")
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload single product image to S3 (Admin only)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.s3Service.uploadImage(file, "products");
    return {
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    };
  }

  @Post("upload-images")
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor("images", 5)) // Max 5 images
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload multiple product images to S3 (Admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    const imageUrls = await this.s3Service.uploadMultipleImages(
      files,
      "products",
    );
    return {
      success: true,
      imageUrls,
      count: imageUrls.length,
      message: "Images uploaded successfully",
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all products" })
  findAll(@Query("category") category?: string) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  findOne(@Param("id") id: string) {
    return this.productsService.findById(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update product (Admin only)" })
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete product (Admin only)" })
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
