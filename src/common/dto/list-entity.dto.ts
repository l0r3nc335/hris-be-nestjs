import { IsOptional, IsString } from 'class-validator';

export class CreateListEntityDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateListEntityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
