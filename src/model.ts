import { ValidatorFn, AsyncValidatorFn, ValidationErrors } from './directives/validators';
import { Observable, Subject } from 'rxjs';
import { composeValidators } from './directives/shared';

export type FormHooks = 'change' | 'blur' | 'submit';
export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const PENDING = 'PENDING';
export const DISABLED = 'DISABLED';

function coerceToValidator(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): ValidatorFn | null {
  const validator = (isOptionsObj(validatorOrOpts) ? (validatorOrOpts as AbstractControlOptions).validators : validatorOrOpts) as
    | ValidatorFn
    | ValidatorFn[]
    | null;

  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

function isOptionsObj(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): boolean {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}

export interface AbstractControlOptions {
  validators?: ValidatorFn | ValidatorFn[] | null;

  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;

  updateOn?: 'change' | 'blur' | 'submit';
}

export abstract class AbstractControl {
  readonly value: any;

  readonly errors!: ValidationErrors | null;

  readonly valueChanges!: Observable<any>;

  readonly statusChanges!: Observable<any>;

  readonly status!: string;

  _updateOn!: FormHooks;
  _asyncValidationSubscription: any;
  _parent!: FormGroup; // | FormArray;
  _onCollectionChange = () => {};

  constructor(public validator: ValidatorFn|null) {}

  get parent(): FormGroup {
    return this._parent;
  }



  get valid(): boolean {
    return this.status === VALID;
  }

  get invalid(): boolean {
    return this.status === INVALID;
  }

  get pending(): boolean {
    return this.status == PENDING;
  }

  get disabled(): boolean {
    return this.status === DISABLED;
  }

  get enabled(): boolean {
    return this.status !== DISABLED;
  }



  /** @internal */
  _initObservables() {
    (this as { valueChanges: Observable<any> }).valueChanges = new Subject();
    (this as { statusChanges: Observable<any> }).statusChanges = new Subject();
  }

  setValidators(newValidator: ValidatorFn | ValidatorFn[] | null): void {
    this.validator = coerceToValidator(newValidator);
  }

  clearValidators(): void {
    this.validator = null;
  }

  disable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {}

  enable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {}

  setParent(parent: FormGroup): void {
    this._parent = parent;
  }

  abstract _updateValue(): void;

  abstract setValue(value: any, options?: Object): void;

  abstract patchValue(value: any, options?: Object): void;

  abstract reset(value?: any, options?: Object): void;

  private _updateAncestors(opts: { onlySelf?: boolean }) {
    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
    }
  }

  private _setInitialStatus() {
    (this as{status: string}).status = this._allControlsDisabled() ? DISABLED : VALID;
  }

  updateValueAndValidity(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    this._setInitialStatus();
    this._updateValue();

    if (this.enabled) {
      (this as { errors: ValidationErrors | null }).errors = this._runValidator();
      (this as { status: string }).status = this._calculateStatus();
    }

    if (opts.emitEvent !== false) {
      (this.valueChanges as Subject<any>).next(this.value);
      (this.statusChanges as Subject<any>).next(this.status);
    }

    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
    }
  }
  private _runValidator(): ValidationErrors | null {
    return this.validator ? this.validator(this) : null;
  }

  private _calculateStatus(): string {
    if (this._allControlsDisabled()) return DISABLED;
    if (this.errors) return INVALID;
    if (this._anyControlsHaveStatus(PENDING)) return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

  _anyControlsHaveStatus(status: string): boolean {
    return this._anyControls((control: AbstractControl) => control.status === status);
  }

  abstract _anyControls(condition: Function): boolean;

  /** @internal */
  abstract _allControlsDisabled(): boolean;

  setErrors(errors: ValidationErrors | null, opts: { emitEvent?: boolean } = {}): void {
    (this as { errors: ValidationErrors | null }).errors = errors;
    this._updateControlsErrors(opts.emitEvent !== false);
  }

  getError(errorCode: string, path?: Array<string | number> | string): any {
    const control = path ? null : this;
    return control && control.errors ? control.errors[errorCode] : null;
  }

  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    return !!this.getError(errorCode, path);
  }

  get root(): AbstractControl {
    let x: AbstractControl = this;

    while (x._parent) {
      x = x._parent;
    }

    return x;
  }

  _updateControlsErrors(emitEvent: boolean): void {
    // (this as { status: string }).status = this._calculateStatus();

    if (emitEvent) {
      // (this.statusChanges as EventEmitter<string>).emit(this.status);
    }

    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent);
    }
  }

  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
  }

  _isBoxedValue(formState: any): boolean {
    return typeof formState === 'object' && formState !== null &&
        Object.keys(formState).length === 2 && 'value' in formState && 'disabled' in formState;
  }
}

export class FormControl extends AbstractControl {
  /** @internal */
  _onChange: Function[] = [];

  /** @internal */
  _pendingValue: any;

  /** @internal */
  _pendingChange: any;

  constructor(
    formState: any = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(coerceToValidator(validatorOrOpts));
    this._applyFormState(formState);
    // this._setUpdateStrategy(validatorOrOpts);
    this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this._initObservables();
  }

  setValue(
    value: any,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ): void {
    (this as { value: any }).value = this._pendingValue = value;
    if (this._onChange.length && options.emitModelToViewChange !== false) {
      this._onChange.forEach(changeFn => changeFn(this.value, options.emitViewToModelChange !== false));
    }
    this.updateValueAndValidity(options);
  }

  patchValue(
    value: any,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ): void {
    this.setValue(value, options);
  }

  reset(formState: any = null, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    // this._applyFormState(formState);
    // this.markAsPristine(options);
    // this.markAsUntouched(options);
    // this.setValue(this.value, options);
    // this._pendingChange = false;
  }

  /**
   * @internal
   */
  _updateValue() {}

  /**
   * @internal
   */
  _anyControls(condition: Function): boolean {
    return false;
  }

  /**
   * @internal
   */
  _allControlsDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Register a listener for change events.
   *
   * @param fn The method that is called when the value changes
   */
  registerOnChange(fn: Function): void {
    this._onChange.push(fn);
  }

  /**
   * @internal
   */
  _clearChangeFns(): void {
    this._onChange = [];
    // this._onDisabledChange = [];
    this._onCollectionChange = () => {};
  }

  /**
   * Register a listener for disabled events.
   *
   * @param fn The method that is called when the disabled status changes.
   */
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    // this._onDisabledChange.push(fn);
  }

  /**
   * @internal
   */
  _forEachChild(cb: Function): void {}

  private _applyFormState(formState: any) {
    if (this._isBoxedValue(formState)) {
      (this as{value: any}).value = this._pendingValue = formState.value;
      formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
                           this.enable({onlySelf: true, emitEvent: false});
    } else {
      (this as{value: any}).value = this._pendingValue = formState;
    }
  }
}

export class FormGroup extends AbstractControl {
  constructor(
    public controls: { [key: string]: AbstractControl },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(coerceToValidator(validatorOrOpts));
    this._initObservables();
    // this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  registerControl(name: string, control: AbstractControl): AbstractControl {
    if (this.controls[name]) return this.controls[name];
    this.controls[name] = control;
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }

  addControl(name: string, control: AbstractControl): void {
    this.registerControl(name, control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  removeControl(name: string): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete this.controls[name];
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  setControl(name: string, control: AbstractControl): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete this.controls[name];
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  contains(controlName: string): boolean {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }

  setValue(value: { [key: string]: any }, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    this._checkAllValuesPresent(value);
    Object.keys(value).forEach(name => {
      this._throwIfControlMissing(name);
      this.controls[name].setValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
    });
    this.updateValueAndValidity(options);
  }

  patchValue(value: { [key: string]: any }, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    Object.keys(value).forEach(name => {
      if (this.controls[name]) {
        this.controls[name].patchValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
      }
    });
    this.updateValueAndValidity(options);
  }

  reset(value: any = {}, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      control.reset(value[name], { onlySelf: true, emitEvent: options.emitEvent });
    });
    this.updateValueAndValidity(options);
    // this._updatePristine(options);
    // this._updateTouched(options);
  }

  getRawValue(): any {
    return this._reduceChildren({}, (acc: { [k: string]: AbstractControl }, control: AbstractControl, name: string) => {
      acc[name] = control instanceof FormControl ? control.value : (<any>control).getRawValue();
      return acc;
    });
  }

  /** @internal */
  _throwIfControlMissing(name: string): void {
    if (!Object.keys(this.controls).length) {
      throw new Error(`
        There are no form controls registered with this group yet.  If you're using ngModel,
        you may want to check next tick (e.g. use setTimeout).
      `);
    }
    if (!this.controls[name]) {
      throw new Error(`Cannot find form control with name: ${name}.`);
    }
  }

  /** @internal */
  _forEachChild(cb: (v: any, k: string) => void): void {
    Object.keys(this.controls).forEach(k => cb(this.controls[k], k));
  }

  /** @internal */
  _setUpControls(): void {
    this._forEachChild((control: AbstractControl) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }

  /** @internal */
  _updateValue(): void {
    (this as { value: any }).value = this._reduceValue();
  }

  /** @internal */
  _anyControls(condition: Function): boolean {
    let res = false;
    this._forEachChild((control: AbstractControl, name: string) => {
      res = res || (this.contains(name) && condition(control));
    });
    return res;
  }

  /** @internal */
  _reduceValue() {
    return this._reduceChildren({}, (acc: { [k: string]: AbstractControl }, control: AbstractControl, name: string) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
      return acc;
    });
  }

  /** @internal */
  _reduceChildren(initValue: any, fn: Function) {
    let res = initValue;
    this._forEachChild((control: AbstractControl, name: string) => {
      res = fn(res, control, name);
    });
    return res;
  }

  /** @internal */
  _allControlsDisabled(): boolean {
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }

  /** @internal */
  _checkAllValuesPresent(value: any): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      if (value[name] === undefined) {
        throw new Error(`Must supply a value for form control with name: '${name}'.`);
      }
    });
  }
}
