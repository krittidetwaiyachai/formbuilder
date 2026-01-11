import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  color?: string;
}
