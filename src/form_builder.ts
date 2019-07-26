
import {AsyncValidatorFn, ValidatorFn} from './directives/validators';
import {AbstractControl, AbstractControlOptions, FormControl, FormGroup, FormHooks} from './model';

function isAbstractControlOptions(options: AbstractControlOptions | {[key: string]: any}):
    options is AbstractControlOptions {
  return (<AbstractControlOptions>options).asyncValidators !== undefined ||
      (<AbstractControlOptions>options).validators !== undefined ||
      (<AbstractControlOptions>options).updateOn !== undefined;
}

export class FormBuilder {
  group(controlsConfig: {[key: string]: any},
    options: AbstractControlOptions|{[key: string]: any}|null = null): FormGroup {
    const controls = this._reduceControls(controlsConfig);

    let validators: ValidatorFn|ValidatorFn[]|null = null;
    let asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null = null;
    let updateOn: FormHooks|undefined = undefined;

    if (options != null) {
      if (isAbstractControlOptions(options)) {
        // `options` are `AbstractControlOptions`
        validators = options.validators != null ? options.validators : null;
        asyncValidators = options.asyncValidators != null ? options.asyncValidators : null;
        updateOn = options.updateOn != null ? options.updateOn : undefined;
      } else {
        // `options` are legacy form group options
        validators = options.validator != null ? options.validator : null;
        asyncValidators = options.asyncValidator != null ? options.asyncValidator : null;
      }
    }
    let returnData = new FormGroup(controls, { asyncValidators, updateOn, validators });
    returnData.bind = returnData.getRawValue();
    return returnData;
  }

  control(
      formState: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormControl {
    return new FormControl(formState, validatorOrOpts, asyncValidator);
  }

  // array(
  //     controlsConfig: any[],
  //     validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
  //     asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormArray {
  //   const controls = controlsConfig.map(c => this._createControl(c));
  //   return new FormArray(controls, validatorOrOpts, asyncValidator);
  // }

  /** @internal */
  _reduceControls(controlsConfig: {[k: string]: any}): {[key: string]: AbstractControl} {
    const controls: {[key: string]: AbstractControl} = {};
    Object.keys(controlsConfig).forEach(controlName => {
      controls[controlName] = this._createControl(controlsConfig[controlName]);
    });
    return controls;
  }

  /** @internal */
  _createControl(controlConfig: any): AbstractControl {
    if (controlConfig instanceof FormControl || controlConfig instanceof FormGroup) {
      return controlConfig;

    } else if (Array.isArray(controlConfig)) {
      const value = controlConfig[0];
      const validator: ValidatorFn = controlConfig.length > 1 ? controlConfig[1] : null;
      const asyncValidator: AsyncValidatorFn = controlConfig.length > 2 ? controlConfig[2] : null;
      return this.control(value, validator, asyncValidator);

    } else {
      return this.control(controlConfig);
    }
  }
}