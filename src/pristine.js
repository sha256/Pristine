import { lang } from './lang';
import * as utils from './utils';

let defaultConfig = {
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    errorTextParent: 'form-group',
    errorTextTag: 'div',
    errorTextClass: 'text-help'
};

const PRISTINE_ERROR = 'pristine-error';

const validators = {};

const _ = function (name, validator) {
    validator.name = name;
    validators[name] = validator;
};

_('text', {fn: (val) => true, priority: 0});
_('required', {fn: (val) => val !== '', msg: lang['required'], priority: 99, halt: true});
_('email', {fn: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), msg: lang['email'], priority: 1});
_('number', {fn: (val) => parseFloat(val), msg: lang['number'], priority: 1});
_('minlength', {fn: (val, input, length) => val && val.length >= parseInt(length), msg: 'wrrr', priority: 1});
_('maxlength', {fn: (val, input, length) => val && val.length <= parseInt(length), msg: 'wrrr', priority: 1});
_('min', {fn: (val, input, limit) => parseFloat(val) >= parseFloat(limit), msg: 'wrrr', priority: 1});
_('max', {fn: (val, input, limit) => parseFloat(val) <= parseFloat(limit), msg: 'wrrr', priority: 1});


const SELECTOR = "input:not([type^=hidden]):not([type^=button]), select, textarea";

const allowedAttributes = ["required", "min", "max", 'minlength', 'maxlength'];

export function Pristine(form, config, online){
    
    let self = this;

    init(form, config, online);
    
    function init(form, config, online){
        self.config = config || defaultConfig;
        self.online = !(online === false);
        self.valid = undefined;
        self.form = form;
        self.fields = Array.from(form.querySelectorAll(SELECTOR)).map(function (input) {

            let fns = [];
            let params = {};

            allowedAttributes.forEach(function (item) {
                let val = input.getAttribute(item);
                if (val !== null){
                    _addValidatorToField(fns, params, item, val);
                }
            });

            [].forEach.call(input.attributes, function (attr) {
                if (/^data-pristine-/.test(attr.name)) {
                    let name = attr.name.substr(14);
                    if (name === 'type') name = attr.value;
                    _addValidatorToField(fns, params, name, attr.value);
                }
            });

            _addValidatorToField(fns, params, input.getAttribute('type'));

            fns.sort(function (a, b) {
               return b.priority - a.priority;
            });

            self.online && input.addEventListener((!~['radio', 'checkbox'].indexOf(input.getAttribute('type')) ? 'input':'change'), function(e) {
                self.validate(e.target);
            }.bind(self));

            input.pristine = {input, validators: fns, params};
            return input.pristine;

        }.bind(self));
    }

    self.validate = function(input, silent){
        silent = (input && silent === true) || input === true;
        let fields = typeof input === "object" ? (input.length ? input : [input]) : null;
        fields = fields ? Array.from(fields).map((f)=> f.pristine) : self.fields;
        for(let i in fields){
            let field = fields[i];
            let valid = _validateField(field);
            field.input.pristine.messages = field.messages;
            if (valid){
                !silent && _showSuccess(field);
            } else {
                self.valid = false;
                !silent && _showError(field, field.messages);
            }
        }
        return self.valid;
    };

    self.isValid = function () {
        return self.valid;
    };

    self.getErrorMessages = function(input) {
        return input.length ? input[0].pristine.messages : input.pristine.messages;
    };

    function _validateField(field){
        let messages = [];
        let valid = true;
        for(let i in field.validators){
            let validator = field.validators[i];
            var params = field.params[validator.name] ? field.params[validator.name] : [];
            // input value of select element
            if (!validator.fn(field.input.value, field.input, ...params)){
                valid = false;
                messages.push(validator.msg);
                if (validator.halt === true){
                    break;
                }
            }
        }
        field.messages = messages;
        return valid;
    }

    self.addValidator = function(elemOrName, fn, msg, priority, halt){
        if (typeof elemOrName === 'string'){
            _(elemOrName, {fn, msg, priority, halt});
        } else if (typeof elemOrName === 'object'){
            //TODO check if pristine field
            elemOrName.pristine.validators.push({fn, msg, priority, halt});
            elemOrName.pristine.validators.sort(function (a, b) {
               return b.priority - a.priority;
            });
        }

    };

    function _showError(field, messages){
        let ret = _removeError(field);
        let errorClassElement = ret[0], errorTextParent = ret[1];
        errorClassElement.classList.add(self.config.errorClass);

        let elem = document.createElement(self.config.errorTextTag);
        elem.className = PRISTINE_ERROR + ' ' + self.config.errorTextClass;
        elem.innerHTML = messages.join('<br/>');
        errorTextParent.appendChild(elem);
    }

    function _removeError(field){
        let errorClassElement = utils.findAncestor(field.input, self.config.classTo);
        errorClassElement.classList.remove(self.config.errorClass, self.config.successClass);

        let errorTextParent = utils.findAncestor(field.input, self.config.errorTextParent);
        var existing = errorTextParent.querySelector('.' + PRISTINE_ERROR);
        if (existing){
            existing.parentNode.removeChild(existing);
        }
        return [errorClassElement, errorTextParent]
    }

    function _showSuccess(field){
        let errorClassElement = _removeError(field)[0];
        errorClassElement.classList.add(self.config.successClass);
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
                params[name] = value.split(',');
            }
        }
    }

    return self;

}

export function setConfig(config) {
    defaultConfig = config;
}