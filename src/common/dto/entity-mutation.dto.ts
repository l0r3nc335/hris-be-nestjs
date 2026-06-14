import { IsOptional, IsString } from 'class-validator';

export class CreateEntityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateEntityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
