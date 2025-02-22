import type { NextFunction, Request, Response } from "express";
import error from "../utils/error";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.params;
    if (!email) {
      throw error("User not found", 404);
    }
    next();
  } catch (e) {
    next(e);
  }
}

export default authenticate;
