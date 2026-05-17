import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

const INBOUND_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        roles: string[];
      };
    }
  }
}

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const id = incoming && INBOUND_PATTERN.test(incoming) ? incoming : uuidv4();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};
