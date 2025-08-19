import { IsEmail, IsString, Length } from 'class-validator';
export class RegisterDto {
  @IsString() @Length(1, 80) name!: string;
  @IsEmail() email!: string;
  @IsString() @Length(8, 72) password!: string;
}
