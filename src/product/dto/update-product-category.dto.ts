import {
  IsUUID,
} from "class-validator";

export class UpdateProductCategoryDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  category_id: string;
}
