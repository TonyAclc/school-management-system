import { randomBytes, createHash } from 'crypto';

export const generateRefreshToken = () => randomBytes(48).toString('base64url');
export const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');
