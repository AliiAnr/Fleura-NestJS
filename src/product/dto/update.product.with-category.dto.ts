import { IsOptional, IsUUID } from "class-validator";
import { UpdateProductDto } from "./update.product.dto";

export class UpdateProductWithCategoryDto extends UpdateProductDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;
}
