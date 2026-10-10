import type { Role, VendorStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
      vendor?: { id: string; name: string; status: VendorStatus };
      admin?: { id: string; email: string | null; name: string | null; role: Role };
    }
  }
}

export {};
