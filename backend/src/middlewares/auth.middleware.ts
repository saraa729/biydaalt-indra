import prisma from "../config/db.js";
import { verifyJwt } from "../utils/jwt.js";

type UserLike = {
  id: number;
  isActive?: boolean;
  role?: {
    name?: string;
  };
};

type RequestLike = {
  headers: {
    authorization?: string;
  };
  user?: UserLike;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
};

type NextLike = () => void;

const authenticate = async (req: RequestLike, res: ResponseLike, next: NextLike) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT secret is not configured.' });
    }

    const decoded = verifyJwt(token, secret);

    if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
      throw new Error('TokenExpiredError');
    }

    const user = (await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    })) as UserLike | null;

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.message === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please sign in again.' });
    }

    if (error.message === 'Invalid token' || error.message === 'Unsupported algorithm' || error.message === 'Invalid signature') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const authMiddleware = authenticate;

const authorize = (...roles: string[]) => {
  return (req: RequestLike, res: ResponseLike, next: NextLike) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = req.user.role?.name;

    if (!roles.includes(userRole ?? '')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

export { authenticate, authMiddleware, authorize };
