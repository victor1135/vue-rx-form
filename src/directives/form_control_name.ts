import { DirectiveOptions } from 'vue';
import { FormControl } from '../model';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '..';
const namespace = '@@vue-formControlName-directive';

class FormControlNameDirective {
  public unbind: any;
  constructor(public el: HTMLInputElement, public vnode: any, public formControl: FormGroup , public formControlName: string) {
    this.formControl = formControl;
    vnode.componentInstance.$on('input', (v) => {
      this.formControl.controls[formControlName].setValue(v);
    })
    const instance = vnode.componentInstance.$on('input', (v) => {
      this.formControl.controls[formControlName].setValue(v);
    });
    this.unbind = instance;
  }

  doUnbind() {
    this.unbind.$off('input');
  }
}

const FormControlName: DirectiveOptions = {
  bind(el: any, binding: any, vnode) {
    if (binding.value) {
        const formControl = binding.value;
        if(el[`${namespace}${binding.arg}`]) {
          el[`${namespace}${binding.arg}`].doUnbind();
        }
        el[`${namespace}${binding.arg}`] = new FormControlNameDirective(el, vnode, formControl, binding.arg);
    }
  },
  unbind(el, binding, vnode) {
    if (el[`${namespace}${binding.arg}`]) {
      el[`${namespace}${binding.arg}`].doUnbind();
      el[`${namespace}${binding.arg}`] = undefined;
    }
  }
};

export default FormControlName;
