import { Request, Response } from "express";

export abstract class BaseController {
  protected parsePaginationParams(query: any): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 30));
    return { page, limit };
  }
}