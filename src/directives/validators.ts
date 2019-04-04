import { AbstractControl } from "@/model";
import { Observable } from "rxjs";

export type ValidationErrors = {
  [key: string]: any;
};

export interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}
export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null;
}

export interface Validator {
  validate(control: AbstractControl): ValidationErrors | null;

  registerOnValidatorChange?(fn: () => void): void;
}

export interface AsyncValidator extends Validator {

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

export function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn | any {
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
