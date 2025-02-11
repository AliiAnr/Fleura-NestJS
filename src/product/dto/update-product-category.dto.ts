import {
  IsUUID,
} from "class-validator";

export class UpdateProductCategoryDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  categoryId: string;
}
