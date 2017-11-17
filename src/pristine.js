import { lang } from './lang';
import { tmpl, findAncestor, groupedElemCount } from './utils';

let defaultConfig = {
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    errorTextParent: 'form-group',
    errorTextTag: 'div',
    errorTextClass: 'text-help'
};

const PRISTINE_ERROR = 'pristine-error';
const SELECTOR = "input:not([type^=hidden]):not([type^=submit]), select, textarea";
const ALLOWED_ATTRIBUTES = ["required", "min", "max", 'minlength', 'maxlength'];

const validators = {};

const _ = function (name, validator) {
    validator.name = name;
    if (!validator.msg)
        validator.msg = lang[name];
    if (validator.priority === undefined)
        validator.priority = 1;
    validators[name] = validator;
};

_('text', { fn: (val) => true, priority: 0});
_('required', { fn: function(val){ return (this.type === 'radio' || this.type === 'checkbox') ? groupedElemCount(this) : val !== undefined && val !== ''}, priority: 99, halt: true});
_('email', { fn: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)});
_('number', { fn: (val) => !isNaN(parseFloat(val)) });
_('minlength', { fn: (val, length) => val && val.length >= parseInt(length) });
_('maxlength', { fn: (val, length) => val && val.length <= parseInt(length) });
_('min', { fn: function(val, limit){ return this.type === 'checkbox' ? groupedElemCount(this) >= parseInt(limit) : parseFloat(val) >= parseFloat(limit); } });
_('max', { fn: function(val, limit){ return this.type === 'checkbox' ? groupedElemCount(this) <= parseInt(limit) : parseFloat(val) <= parseFloat(limit); } });
_('pattern', { fn: (val, pattern) => {let m = pattern.match(new RegExp('^/(.*?)/([gimy]*)$')); return (new RegExp(m[1], m[2])).test(val);} });


export default function Pristine(form, config, live){
    
    let self = this;

    init(form, config, live);
    
    function init(form, config, live){
        self.form = form;
        self.config = config || defaultConfig;
        self.live = !(live === false);
        self.fields = Array.from(form.querySelectorAll(SELECTOR)).map(function (input) {

            let fns = [];
            let params = {};
            let messages = {};

            [].forEach.call(input.attributes, function (attr) {
                if (/^data-pristine-/.test(attr.name)) {
                    let name = attr.name.substr(14);
                    if (name.endsWith('-message')){
                        messages[name.slice(0, name.length-8)] = attr.value;
                        return;
                    }
                    if (name === 'type') name = attr.value;
                    _addValidatorToField(fns, params, name, attr.value);
                } else if (~ALLOWED_ATTRIBUTES.indexOf(attr.name)){
                    _addValidatorToField(fns, params, attr.name, attr.value);
                } else if (attr.name === 'type'){
                    _addValidatorToField(fns, params, attr.value);
                }
            });

            fns.sort( (a, b) => b.priority - a.priority);

            self.live && input.addEventListener((!~['radio', 'checkbox'].indexOf(input.getAttribute('type')) ? 'input':'change'), function(e) {
                self.validate(e.target);
            }.bind(self));

            return input.pristine = {input, validators: fns, params, messages, self};

        }.bind(self));
    }

    self.validate = function(input, silent){
        silent = (input && silent === true) || input === true;
        let fields = self.fields;
        if (input !== true && input !== false){
            if (input instanceof HTMLElement) {
                fields = [input.pristine];
            } else if (input instanceof NodeList || input instanceof (window.$ || Array) || input instanceof Array){
                fields = Array.from(input).map(el => el.pristine);
            }
        }

        let valid = true;

        for(let i in fields){
            let field = fields[i];
            if (_validateField(field)){
                !silent && _showSuccess(field);
            } else {
                valid = false;
                !silent && _showError(field);
            }
        }
        return valid;
    };

    self.getErrors = function(input) {
        return input.length ? input[0].pristine.errors : input.pristine.errors;
    };

    function _validateField(field){
        let errors = [];
        let valid = true;
        for(let i in field.validators){
            let validator = field.validators[i];
            let params = field.params[validator.name] ? field.params[validator.name] : [];
            params[0] = field.input.value;
            if (!validator.fn.apply(field.input, params)){
                valid = false;
                let error = field.messages[validator.name] || validator.msg;
                errors.push(tmpl.apply(error, params));
                if (validator.halt === true){
                    break;
                }
            }
        }
        field.errors = errors;
        return valid;
    }

    self.addValidator = function(elemOrName, fn, msg, priority, halt){
        if (typeof elemOrName === 'string'){
            _(elemOrName, {fn, msg, priority, halt});
        } else if (elemOrName instanceof HTMLElement){
            elemOrName.pristine.validators.push({fn, msg, priority, halt});
            elemOrName.pristine.validators.sort( (a, b) => b.priority - a.priority);
        }

    };

    function _showError(field){
        let ret = _removeError(field);
        let errorClassElement = ret[0], errorTextParent = ret[1];
        errorClassElement && errorClassElement.classList.add(self.config.errorClass);

        let elem = document.createElement(self.config.errorTextTag);
        elem.className = PRISTINE_ERROR + ' ' + self.config.errorTextClass;
        elem.innerHTML = field.errors.join('<br/>');
        errorTextParent && errorTextParent.appendChild(elem);
    }

    self.addError = function(input, error) {
        input = input.length ? input[0] : input;
        input.pristine.errors.push(error);
        _showError(input.pristine);
    };

    function _removeError(field){
        let errorClassElement = findAncestor(field.input, self.config.classTo);
        errorClassElement && errorClassElement.classList.remove(self.config.errorClass, self.config.successClass);

        let errorTextParent = findAncestor(field.input, self.config.errorTextParent);
        var existing = errorTextParent ? errorTextParent.querySelector('.' + PRISTINE_ERROR) : null;
        if (existing){
            existing.parentNode.removeChild(existing);
        }
        return [errorClassElement, errorTextParent]
    }

    function _showSuccess(field){
        let errorClassElement = _removeError(field)[0];
        errorClassElement && errorClassElement.classList.add(self.config.successClass);
    }

    self.reset = function () {
        Array.from(self.form.querySelectorAll('.' + PRISTINE_ERROR)).map(function (elem) {
            elem.parentNode.removeChild(elem);
        });
        Array.from(self.form.querySelectorAll('.' + self.config.classTo)).map(function (elem) {
            elem.classList.remove(self.config.successClass, self.config.errorClass);
        });

    };

    self.destroy = function(){
        self.reset();
        self.fields.forEach(function (field) {
            delete field.input.pristine;
        });
        self.fields = [];
    };

    function _addValidatorToField(fns, params, name, value) {
        let validator = validators[name];
        if (validator) {
            fns.push(validator);
            if (value) {
                let valueParams = value.split(',');
                valueParams.unshift(null); // placeholder for input's value
                params[name] = valueParams;
            }
        }
    }

    self.setGlobalConfig = function (config) {
        defaultConfig = config;
    };

    return self;

}