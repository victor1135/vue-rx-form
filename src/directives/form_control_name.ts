import { DirectiveOptions } from 'vue';
import { FormControl } from '@/model';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
const namespace = '@@vue-formControlName-directive';

class FormControlNameDirective {
  dispose: Subject<boolean>;
  constructor(public el: HTMLInputElement, public vm: any, public formControlName: FormControl) {
    this.el = el;
    this.vm = vm;
    this.dispose = new Subject<boolean>();
    this.formControlName.valueChanges.pipe(takeUntil(this.dispose)).subscribe((newValue: any) => {
      if (newValue !== el.value) {
        el.value = newValue;
      }
    });
    fromEvent(this.el, 'input')
      .pipe(takeUntil(this.dispose))
      .subscribe((newValue: Event) => {
        if (newValue.currentTarget) {
          const target = newValue.currentTarget as HTMLInputElement;
          this.formControlName.setValue(target.value);
        }
      });
    el.value = formControlName.value;
  }

  doUnbind() {
    this.dispose.next(true);
  }
}

const FormControlName: DirectiveOptions = {
  bind(el: any, binding, vnode) {
    if (binding.value) {
      const formControl = binding.value as FormControl;
      el[namespace] = new FormControlNameDirective(el, vnode.context, formControl);
    }
  },
  unbind(el: any, bind, vnode) {
    if (el[namespace]) {
      el[namespace].doUnbind();
      el[namespace] = undefined;
    }
  }
};

export default FormControlName;
