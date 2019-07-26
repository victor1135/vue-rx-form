import { Validators } from "../validators";
import { Validator, ValidatorFn, AsyncValidatorFn, AsyncValidator } from "./validators";
import { AbstractControl } from "..";

export function composeValidators(validators: Array<Validator | any>): ValidatorFn | null {
  return validators != null ? Validators.compose(validators.map(normalizeValidator)) : null;
}

export function composeAsyncValidators(validators: Array<Validator | any>): AsyncValidatorFn | null {
  return validators != null ? Validators.composeAsync(validators.map(normalizeAsyncValidator)) : null;
}

export function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn {
  if ((<Validator>validator).validate) {
    return (c: AbstractControl) => (<Validator>validator).validate(c);
  } else {
    return <ValidatorFn>validator;
  }
}

export function normalizeAsyncValidator(validator: AsyncValidatorFn | AsyncValidator): AsyncValidatorFn {
  if ((<AsyncValidator>validator).validate) {
    return (c: AbstractControl) => (<AsyncValidator>validator).validate(c);
  } else {
    return <AsyncValidatorFn>validator;
  }
}
