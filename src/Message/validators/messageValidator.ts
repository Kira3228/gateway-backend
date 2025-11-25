import { check } from "express-validator";

export const messageValidate = [
  check('page')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Параметр page обязателен')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('page должно быть числом больше 0'),
  check('limit')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Параметр page обязателен')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('limit должно быть числом больше 0'),
]