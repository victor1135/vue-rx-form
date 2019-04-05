# vue-reactive-form

## Project setup
```
npm install vue-rx-form --save
```

# Usage

## Table of Contents
* [Basic Implement](##Basic-Implement)
  * [Step1 Importing a new form control](###Step1-Importing-a-new-form-control)
  * [Step2 Using directive in a component](###Step2-Using-directive-in-a-component)
  * [Step3 Creating a FormGroup instance](###Step3-Creating-a-FormGroup-instance)
  * [Step4 Associating the FormControl model and view](###Step4-Associating-the-FormControl-model-and-view)
  * [Step5 Get form data](##Step5-Get-form-data)

* [Form Validation](##Form-Validation)
  * [Add Validator](###Add-Validator)
* [Reactive Forms](##Reactive-Forms)
  * [Listening for Changes](###Listening-for-Changes)

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


## Reactive Forms
### Listening for Changes
```Javascript
myForm: FormGroup;
formattedMessage: string;

formBuilder: FormBuilder = new FormBuilder();

created() {
  this.myForm = this.formBuilder.group({
    name: '',
    email: '',
    message: ''
  });

  this.myForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['',[Validators.required, Validators.email]],
    message: ''
  })

  this.onChanges();
}
```

Notice how we call an onChanges method in the created lifecycle hook after having initialized our form. Here’s the content of our onChanges method:

```Javascript
onChanges() {
  this.myForm.valueChanges.subscribe(val => {
    this.formattedMessage =
    `Hello,

    My name is ${val.name} and my email is ${val.email}.

    I would like to tell you that ${val.message}.`;
  });
}
```
You can also listen for changes on specific form controls instead of the whole form group:

```Javascript
onChanges() {
  this.myForm.get('name').valueChanges.subscribe(val => {
    this.formattedMessage = `My name is ${val}.`;
  });
}
```
