import prisma from '../db';
import { BaseRepository } from './BaseRepository';
import { User, Prisma } from '../../generated/prisma/client';

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    super(prisma.user);
  }

  // Example of a custom repository method
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }
}

// Export a singleton instance for easy use in Server Components/Actions
export const userRepository = new UserRepository();
