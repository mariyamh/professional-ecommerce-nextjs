import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>("AWS_REGION") || "us-east-1",
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey:
          this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
      },
    });
    this.bucketName =
      this.configService.get<string>("AWS_S3_BUCKET_NAME") || "";
  }

  /**
   * Upload image to S3
   * @param file - Multer file object
   * @param folder - S3 folder (e.g., 'products', 'users')
   * @returns S3 file URL
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = "products",
  ): Promise<string> {
    // Validate file
    this.validateImage(file);

    // Generate unique filename
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Make file publicly accessible
    });

    await this.s3Client.send(command);

    // Return public URL
    return `https://${this.bucketName}.s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${fileName}`;
  }

  /**
   * Upload multiple images
   * @param files - Array of Multer files
   * @param folder - S3 folder
   * @returns Array of S3 URLs
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = "products",
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  }

  /**
   * Delete file from S3
   * @param fileUrl - Full S3 URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // Extract key from URL
    const key = fileUrl.split(".com/")[1];

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Generate pre-signed URL for temporary access
   * @param key - S3 object key
   * @param expiresIn - Expiration in seconds (default: 1 hour)
   * @returns Pre-signed URL
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Validate image file
   * @param file - Multer file object
   */
  private validateImage(file: Express.Multer.File): void {
    // Check file exists
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    // Allowed MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
      );
    }

    // Max file size: 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException("File size must not exceed 5MB");
    }
  }
}
