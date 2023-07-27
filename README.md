# Pristine - Vanilla javascript form validation library
{:.hide}

**~4kb minified, ~2kb gzipped, no dependencies**

## Living demo

Some examples of use can be found [here](http://pristine.js.org/demo.html).

## Usage

Include the javascript file in your html head or just before the closing body tag

```html 
<script src="dist/pristine.js"  type="text/javascript"></script>
```

Now create some form and validate

```javascript
window.onload = function () {

    var form = document.getElementById("form1");

    // create the pristine instance
    var pristine = new Pristine(form);

    form.addEventListener('submit', function (e) {
       e.preventDefault();
       
       // check if the form is valid
       var valid = pristine.validate(); // returns true or false

    });
};

```

**That's it**

It automatically validates `required, min, max, minlength, maxlength` attributes and the value of type attributes
 like `email, number` and more..
 

`Pristine` takes `3` parameters

- **form** The form element

- **config** An object containing the configuration. Default is bootstrap's configuration which is 

<a id="defaultConfig"></a>

```javascript
let defaultConfig = {
    // class of the parent element where the error/success class is added
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    // class of the parent element where error text element is appended
    errorTextParent: 'form-group',
    // type of element to create for the error text
    errorTextTag: 'div',
    // class of the error text element
    errorTextClass: 'text-help' 
};
```

- **live** A boolean value indicating whether pristine should validate as you type, default is `true`


## Install

```sh
$ npm install pristinejs --save
```


## Custom Validator

```javascript
pristine.addValidator(nameOrElem, handler, errorMessage, priority, halt);
```

### Add a custom validator to a field

```javascript
var pristine = new Pristine(document.getElementById("form1"));

var elem = document.getElementById("email");

// A validator to check if the first letter is capitalized
pristine.addValidator(elem, function(value) {
    // here `this` refers to the respective input element
    if (value.length && value[0] === value[0].toUpperCase()){
        return true;
    }
    return false;
}, "The first character must be capitalized", 2, false);
```

### Add a global custom validator
```javascript
// A validator to check if the input value is within a specified range
// Global validators must be added before creating the pristine instance

Pristine.addValidator("my-range", function(value, param1, param2) {
    // here `this` refers to the respective input element
    return parseInt(param1) <= value && value <= parseInt(param2)
    
}, "The value (${0}) must be between ${1} and ${2}", 5, false);
```

Now you can assign it to your inputs like this 

```html
<input type="text" class="form-control" data-pristine-my-range="10,30" />
```

### Add custom error messages
```html
<input required data-pristine-required-message="My custom message"/>
```
Add an attribute like `data-pristine-<ValidatorName>-message`with the custom message as value to show custom error messages. You can add custom messages like this for as many validators as you need. Here `ValidatorName` means `required`, `email`, `min`, `max` etc.

## Built-in validators

| Name | Usage  | Description|
| ---  | ----   |   -----    |
| `required` | `required` or `data-pristine-required` | Validates required fields|
| `email` | `type="email"` or `data-pristine-type="email"`| Validates email|
| `number`| `type="number"` or `data-pristine-type="number"`| |
| `integer`| `data-pristine-type="integer"`| |
| `minlength` | `minlength="10"` or `data-pristine-minlength="10"` | |
| `maxlength` | `maxlength="10"` or `data-pristine-maxlength="10"` | |
| `min` | `min="20"` or `data-pristine-min="20"` | |
| `max` | `max="100"` or `data-pristine-max="100"` | |
| `pattern` | `pattern="/[a-z]+$/i"` or `data-pristine-pattern="/[a-z]+$/i"`,  `\` must be escaped (replace with `\\`) ||
| `equals` | `data-pristine-equals="#field-selector"`| Check that two fields are equal |



## API
**Pristine(form, config, live)**
<br/>*Constructor*
    
| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ----       |
| `form`| - |<center>✔</center> |The form element|
| `config`| [See above](#defaultConfig)|<center>✕</center>| The config object|
| `live`  | `true`|<center>✕</center>| Whether pristine should validate as you type|


<br/>

**pristine.validate(inputs, silent)**
    <br/>*Validate the form or field(s)*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   ----    | ---        |
| `inputs`| - | <center>✕</center> | When not given, full form is validated. inputs can be one DOM element or a collection of DOM elements returned by `document.getElement...`, `document.querySelector...` or even `jquery` dom|
| `silent`  | `false`|<center>✕</center>| Does not show error messages when `silent` is `true`|


<br/>

**pristine.addValidator(elem, fn, msg, priority, halt)**
<br/>*Add a custom validator*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `elem`| - | <center>✔</center> | The dom element where validator is applied to.|
| `fn`| - | <center>✔</center> | The function that validates the field. Value of the input field gets passed as the first parameter, and the attribute value (split using comma) as the subsequent parameters. For example, for `<input data-pristine-my-validator="10,20,dhaka" value="myValue"/>`, validator function get called like `fn("myValue", 10, 20, "dhaka")`. Inside the function `this` refers to the input element|
| `message`| - | <center>✔</center> | The message to show when the validation fails. It supports simple templating. `${0}` for the input's value, `${1}` and so on are for the attribute values. For the above example, `${0}` will get replaced by `myValue`, `${1}` by `10`, `${2}` by `20`, `${3}` by `dhaka`. It can also be a function which should return the error string. The values and inputs are available as function arguments|
| `priority`| 1 | <center>✕</center> | Priority of the validator function. The higher the value, the earlier it gets called when there are multiple validators on one field. |
| `halt`| `false` | <center>✕</center> | Whether to halt validation on the current field after this validation. When `true` after validating the current validator, rest of the validators are ignored on the current field.|

<br/>

**Pristine.addValidator(name, fn, msg, priority, halt)**
<br/>*Add a global custom validator*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `name`| <center>-</center> | <center>✔</center> | A string, the name of the validator, you can then use `data-pristine-<NAME>` attribute in form fields to apply this validator|
| `....`| - | - | Other parameters same as above |

<br/>

**pristine.getErrors(input)**
<br/>*Get the errors of the form or a specific field*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `input`| - | <center>✕</center> | When `input` is given, it returns the errors of that input element, otherwise returns all errors of the form as an object, using input element as key and corresponding errors as value. `validate()` must be called before expecting this method to return correctly.|


<br/>

**pristine.addError(input, error)**
<br/>*Add A custom error to an input element*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `input`| - | <center>✕</center> | The input element to which the error should be given|
| `error`| - | <center>✔</center> | The error string|

<br/>

**pristine.setGlobalConfig(config)**
<br/>*Set the global configuration*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `config`| - | <center>✔</center> | Set the default configuration globally to use in all forms.|

<br/>

**Pristine.setLocale(locale)**
<br/>*Set the current locale globally*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `locale`| - | <center>✔</center> | Error messages on new Pristine forms will be displayed according to this locale|

<br/>

**Pristine.addMessages(locale, messages)**
<br/>*Set the current locale globally*

| Parameter | Default  | Required? | Description|
| ---       | ----     |   -----   | ---        |
| `locale`| - | <center>✔</center> | The corresponding locale|
| `messages`| - | <center>✔</center> |Object containing validator names as keys and error texts as values |

<br/>

**pristine.reset()**
<br/>*Reset the errors in the form*
    
    
<br/>

**pristine.destroy()**
<br/>*Destroy the pristine object*
    
<br/><br/>
> The goal of this library is not to provide every possible type of validation and thus becoming a bloat. 
> The goal is to provide most common types of validations and a neat way to add custom validators.

## License

[MIT](http://opensource.org/licenses/MIT)
