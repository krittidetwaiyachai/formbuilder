import { IsString } from 'class-validator';
export class UnifiedPublicAnswerDto {
  @IsString()
  fieldId: string;
  @IsString()
  value: string;
}