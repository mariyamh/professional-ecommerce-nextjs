import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";
import { AwsModule } from "../aws/aws.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AwsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
