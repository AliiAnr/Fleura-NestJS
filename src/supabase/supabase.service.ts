import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import * as path from "path";
import { Multer } from "multer";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  private bucket: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    this.bucket = process.env.SUPABASE_BUCKET;
  }

  async uploadFile(folder: string, file: Multer.File): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `${folder}/${Date.now()}${fileExtension}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Failed to upload file: ${error.message}`
        );
      }

      return `${process.env.SUPABASE_URL}/storage/v1/object/public/${this.bucket}/${filename}`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async deleteFile(filePath: string): Promise<void> {
    try {
    //   console.log(`Deleting file: ${filePath}`);
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        throw new InternalServerErrorException(
          `Failed to delete file: ${error.message}`
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
