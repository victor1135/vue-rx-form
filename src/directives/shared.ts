import { Validators } from '@/validators';
import { Validator, ValidatorFn, normalizeValidator } from './validators';

export function composeValidators(validators: Array<Validator |  ValidatorFn>): ValidatorFn | null {
    var ss = validators.map(normalizeValidator);
    return validators != null ? Validators.compose(validators.map(normalizeValidator)) : null;
}