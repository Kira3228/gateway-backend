import { check } from "express-validator";

export const extendedDataValidate = [
  check(`id`)
    .isUUID()
    .withMessage(`id должен быть uuid`)

]