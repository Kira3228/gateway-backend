import { check } from "express-validator";

export const headerValidate = [
  check(`presetName`)
    .notEmpty()
    .withMessage('presetName обязательно')
    .isString()
    .withMessage(`presetName должно быть строкой`)
]