import { check } from "express-validator";

export const headerValidate = [
  check(`presetName`)
]