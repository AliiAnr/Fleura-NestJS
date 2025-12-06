import { IsUUID } from "class-validator";
import { CreateProductDto } from "./create.product.dto";

export class CreateProductWithCategoryDto extends CreateProductDto {
  @IsUUID()
  category_id: string;
}
