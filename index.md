# Pristine - Vanilla javascript form validation library
{:.hide}
{:#xid}

**~4kb minified, ~2kb gzipped, no dependencies**

## [Demo](demo/)

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
 
 
## Install

```sh
$ npm install pristinejs --save
```


`Pristine` takes `3` parameters

- **form** The form element

- **config** An object containing the configuration. Default is bootstrap's configuration which is 

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


## Custom Validator

```javascript
Pristine.addValidator(nameOrElem, handler, errorMessage, priority, halt);
```

### Add a custom validator to a field

```javascript
var pristine = new Pristine(document.getElementById("form1"));

var elem = document.getElementById("email");

// A validator to check if the first letter is capitalized
pristine.addValidator(elem, function(value, elem) {
    if (value.length && value[0] === value[0].toUpperCase()){
        return true;
    }
    return false;
}, "The first character must be capitalized", 2, false);
```

### Add a global validator
```javascript
// A validator to check if the input value is within a specified range
Pristine.addValidator("my-range", function(value, elem, val1, val2) {
    
    return parseInt(val1) <= value && value <= parseInt(val2)
    
}, "The value (${0}) must be between ${1} and ${2}", 5, false);
```

Now you can assign it to your inputs like this 

```html
<input type="text" class="form-control" data-pristine-my-range="10,30" />
```

> The goal of this library is not to provide every possible type of validation and thus becoming a bloat. 
> The goal is to provide most common types of validations and a neat way to add custom validators.
