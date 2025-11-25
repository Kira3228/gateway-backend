import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

export function Validate() {
  return function (target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (req: Request, res: Response, next: NextFunction) {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      return originalMethod.call(this, req, res, next)
    }
    return descriptor
  }
}