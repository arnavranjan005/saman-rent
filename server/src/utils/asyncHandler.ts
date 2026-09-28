import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/** Wrap async route handlers so rejections reach the error middleware. */
export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
