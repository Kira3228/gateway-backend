import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details })
    }
    next()
  }
}