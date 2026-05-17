import { RoleName } from '@prisma/client';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  roles: RoleName[];
}

export interface RequesterContext {
  id: string;
  roles: RoleName[];
}
