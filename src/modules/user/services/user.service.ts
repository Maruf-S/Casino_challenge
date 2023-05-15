import { GraphQLError } from 'graphql';
import { sign } from 'jsonwebtoken';
import dayjs from 'dayjs';
import { jwtSecret } from '../../../config';
import AuthRepository from '../../../repositories/AuthRepository';
import { UserValidations } from '../../../utils/validations';

import {
  LoginInput,
  LoginResponse,
  UserCreateInput,
} from '../generated-types/user-resolvers-types';
export default class UserService {
  authRepository: AuthRepository;
  userValidations: UserValidations;

  constructor() {
    this.userValidations = new UserValidations(prisma);
    this.authRepository = new AuthRepository();
  }
  getLoggedInUser(id: any) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
  async loginUser(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (
      !user ||
      !(await this.authRepository.comparePassword(password, user.password))
    ) {
      throw new GraphQLError('Invalid credentials', {
        extensions: {
          http: { status: 401 },
        },
      });
    }
    const token = sign(
      {
        id: user.id,
      },
      jwtSecret!,
      { expiresIn: '7 days' }
    );

    return {
      expiresAt: dayjs().add(168, 'hours').toDate(),
      id: user.id,
      token,
    };
  }
  async registerUser(input: UserCreateInput) {
    const { dob, password, email } = input;
    await this.userValidations.validateUserSignUp(input);
    return await prisma.user.create({
      data: {
        dob,
        password: await this.authRepository.hashPassword(password),
        email,
      },
    });
  }
}
