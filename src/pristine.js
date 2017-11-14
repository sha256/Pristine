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

function _addValidatorToField(fns, params, name, value) {
    let validator = validators[name];
    if (validator) {
        fns.push(validator);
        if (value) {
            params[name] = value.split(',');
        }
    }
}

export class Pristine {

    constructor(form, config, online){
        this.config = config || defaultConfig;
        this.online = !(online === false);
        this.valid = undefined;
        this.form = form;
        this.fields = Array.from(form.querySelectorAll(SELECTOR)).map(function (input) {

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

            this.online && input.addEventListener((!~['radio', 'checkbox'].indexOf(input.getAttribute('type')) ? 'input':'change'), function(e) {
                this.validate(e.target);
            }.bind(this));

            input.pristine = {input, validators: fns, params};
            return input.pristine;

        }.bind(this));
    }

    validate(input, silent){
        silent = (input && silent === true) || input === true;
        let fields = typeof input === "object" ? (input.length ? input : [input]) : null;
        fields = fields ? Array.from(fields).map((f)=> f.pristine) : this.fields;

        for(let field of fields){
            let valid = this._validateField(field);
            field.input.pristine.messages = field.messages;
            if (valid){
                !silent && this._showSuccess(field);
            } else {
                this.valid = false;
                !silent && this._showError(field, field.messages);
            }
        }
        return this.valid;
    }

    isValid(){
        return this.valid;
    }

    getErrorMessages(input) {
        return input.length ? input[0].pristine.messages : input.pristine.messages;
    }

    _validateField(field){
        let messages = [];
        let valid = true;
        for(let validator of field.validators){
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

    static addValidator(elemOrName, fn, msg, priority, halt){
        if (typeof elemOrName === 'string'){
            _(elemOrName, {fn, msg, priority, halt});
        } else if (typeof elemOrName === 'object'){
            //TODO check if pristine field
            elemOrName.pristine.validators.push({fn, msg, priority, halt});
            elemOrName.pristine.validators.sort(function (a, b) {
               return b.priority - a.priority;
            });
        }

    }

    _showError(field, messages){
        let [errorClassElement, errorTextParent] = this._removeError(field);
        errorClassElement.classList.add(this.config.errorClass);

        let elem = document.createElement(this.config.errorTextTag);
        elem.className = PRISTINE_ERROR + ' ' + this.config.errorTextClass;
        elem.innerHTML = messages.join('<br/>');
        errorTextParent.appendChild(elem);
    }

    _removeError(field){
        let errorClassElement = utils.findAncestor(field.input, this.config.classTo);
        errorClassElement.classList.remove(this.config.errorClass, this.config.successClass);

        let errorTextParent = utils.findAncestor(field.input, this.config.errorTextParent);
        var existing = errorTextParent.querySelector('.' + PRISTINE_ERROR);
        if (existing){
            existing.parentNode.removeChild(existing);
        }
        return [errorClassElement, errorTextParent]
    }

    _showSuccess(field){
        let [errorClassElement, errorTextParent] = this._removeError(field);
        errorClassElement.classList.add(this.config.successClass);
    }

    reset(){
        var self = this;
        Array.from(this.form.querySelectorAll('.' + PRISTINE_ERROR)).map(function (elem) {
            elem.parentNode.removeChild(elem);
        });
        Array.from(this.form.querySelectorAll('.' + this.config.classTo)).map(function (elem) {
            elem.classList.remove(self.config.successClass, self.config.errorClass);
        });

    }

    destroy(){
        this.reset();
        this.fields.forEach(function (field) {
            delete field.input.pristine;
        });
        this.fields = [];
    }

}

export function setConfig(config) {
    defaultConfig = config;
}