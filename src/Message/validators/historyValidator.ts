import { check } from "express-validator";

export const historyValidate= [
  check(`id`)
    .isUUID()
    .withMessage(`id должен быть uuid`),
  check('oldStatuses')
    .optional()
    .isString()
    .withMessage('oldStatuses должно быть строкой'),
  check('newStatuses')
    .optional()
    .isString()
    .withMessage('newStatuses должно быть строкой'),
  check('userType')
    .optional()
    .isString()
    .withMessage('userType должно быть строкой'),
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
  check('changeDatetime')
    .optional()
    .isIn(['ASC', 'DESC', ''])
    .withMessage('changeDatetime должно быть ASC, DESC или пустой строкой'),
];
