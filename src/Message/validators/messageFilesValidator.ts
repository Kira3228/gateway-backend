import { check } from "express-validator";

export const messageFilesValidate = [
  check(`id`)
    .isUUID()
    .withMessage(`id должен быть uuid`),
  check('createdAtOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('createdAtOrder должно быть ASC или DESC'),
  check('fileNameOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('fileNameOrder должно быть ASC или DESC'),
  check('fileSizeBytesOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('fileSizeBytesOrder должно быть ASC или DESC'),
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
]; 