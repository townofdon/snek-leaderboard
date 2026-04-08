import { Request } from "express";
import { validate as validateUuid } from 'uuid';

import { ValidationError } from "./errors";
import { isEmpty } from "./utils";

type BodyValidationFn = (body: Request['body']) => void;

export const bodyValidator = (validations: BodyValidationFn[], req: Request) => {
  const errors: string[] = [];
  for (let i = 0; i < validations.length; i++) {
    try {
      const thunk = validations[i];
      if (thunk && typeof thunk === 'function') {
        thunk(req.body);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        errors.push(err.message);
      } else {
        throw err;
      }
    }
  }
  return errors;
}

export const Validate = {
  Body: {
    present: (fieldName: string): BodyValidationFn => (body) => {
      if (isEmpty(body[fieldName])) {
        throw new ValidationError(`body.${fieldName} is a required field`);
      }
    },
    uuid: (fieldName: string): BodyValidationFn => (body) => {
      Validate.Body.present(fieldName)(body);
      if (!validateUuid(String(body[fieldName] || ''))) {
        throw new ValidationError(`body.${fieldName} is not valid: ${String(body[fieldName])}`);
      }
    },
  },
}

