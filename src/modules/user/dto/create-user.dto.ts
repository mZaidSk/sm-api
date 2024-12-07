import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone number must be valid and contain 10-15 digits.',
  })
  phoneNo: string;

  @IsString()
  gender: string;

  @IsDate()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
