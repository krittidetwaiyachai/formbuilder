import { IsEmail } from 'class-validator';
export class AdminSendTestEmailDto {
  @IsEmail()
  to!: string;
}