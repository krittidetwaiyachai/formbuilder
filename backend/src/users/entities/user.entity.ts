import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: string;
  googleId: string | null;
  photoUrl: string | null;
  provider: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string | null;

  @Exclude()
  sessionToken: string | null;

  @Exclude()
  lastActiveAt: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
