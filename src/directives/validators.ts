import { AbstractControl } from "../model";
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
  validate(control: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

