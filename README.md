# vue-reactive-form

## Project setup
```
npm install vue-rx-form --save
```

# Usage

## Table of Contents
* [Basic Implement](##Basic-Implement)
  * [Step1 Importing a new form control](##Step1-Importing-a-new-form-control)
  * [Step2 Using directive in a component](##Step2-Using-directive-in-a-component)
  * [Step3 Creating a FormGroup instance](##Step3-Creating-a-FormGroup-instance)
  * [Step4 Associating the FormControl model and view](##Step4-Associating-the-FormControl-model-and-view)
  * [Step5 Get form data](##Step5-Get-form-data)

* [Form Validation](##Form-Validation)

## Basic Implement

### Step1 Importing a new form control
```JavaScript
import { FormGroup, FormControl, FormControlName, Validators } from 'vue-rx-form';
```

### Step2 Using directive in a component
```JavaScript
@Component({
  directives: {
    FormControlName
  }
})
```

### Step3 Creating a FormGroup instance
```JavaScript
profileForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
});
```

### Step4 Associating the FormControl model and view
```HTML
  <div>
    <label>
      Name:
      <input type="text" v-formControlName="profileForm.controls.name" />
    </label>

    <label>
      Email:
      <input type="text" v-formControlName="profileForm.controls.email" />
    </label>
    <button :click="onSubmit" :disabled="!profileForm.valid">Submit</button>
  </div>
```
### Step5 Get form data
```Javascript
onSubmit() {
  console.log(this.profileForm.value);
}
```
## Form Validation
### Add Validator
```Javascript
  profileForm: FormGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
  });
```

```HTML
  <div>
    <label>
      Name:
      <input type="text" v-formControlName="profileForm.controls.name" />
      <span v-show="!profileForm.controls.name.valid">{{ profileForm.controls.name.errors }}</span>
    </label>

    <label>
      Email:
      <input type="text" v-formControlName="profileForm.controls.email" />
    </label>
      <span v-show="!profileForm.controls.email.valid">{{ profileForm.controls.email.errors }}</span>
    <button :click="onSubmit" :disabled="!profileForm.valid">Submit</button>
  </div>
```

![image](https://drive.google.com/uc?export=view&id=18Fnst_AUOtWSgCQr4_9gs-Idw7i74GK0)

