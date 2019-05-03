(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Pristine = factory());
}(this, (function () { 'use strict';

var lang = {
    required: "This field is required",
    email: "This field requires a valid e-mail address",
    number: "This field requires a number",
    url: "This field requires a valid website URL",
    tel: "This field requires a valid telephone number",
    maxlength: "This fields length must be < ${1}",
    minlength: "This fields length must be > ${1}",
    min: "Minimum value for this field is ${1}",
    max: "Maximum value for this field is ${1}",
    pattern: "Input must match the pattern ${1}"
};

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls)) {}
    return el;
}

function tmpl(o) {
    var _arguments = arguments;

    return this.replace(/\${([^{}]*)}/g, function (a, b) {
        return _arguments[b];
    });
}

function groupedElemCount(input) {
    return input.pristine.self.form.querySelectorAll('input[name="' + input.getAttribute('name') + '"]:checked').length;
}

function mergeConfig(obj1, obj2) {
    for (var attr in obj2) {
        if (!(attr in obj1)) {
            obj1[attr] = obj2[attr];
        }
    }
    return obj1;
}

var defaultConfig = {
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    errorTextParent: 'form-group',
    errorTextTag: 'div',
    errorTextClass: 'text-help'
};

var PRISTINE_ERROR = 'pristine-error';
var SELECTOR = "input:not([type^=hidden]):not([type^=submit]), select, textarea";
var ALLOWED_ATTRIBUTES = ["required", "min", "max", 'minlength', 'maxlength', 'pattern'];

var validators = {};

var _ = function _(name, validator) {
    validator.name = name;
    if (!validator.msg) validator.msg = lang[name];
    if (validator.priority === undefined) validator.priority = 1;
    validators[name] = validator;
};

_('text', { fn: function fn(val) {
        return true;
    }, priority: 0 });
_('required', { fn: function fn(val) {
        return this.type === 'radio' || this.type === 'checkbox' ? groupedElemCount(this) : val !== undefined && val !== '';
    }, priority: 99, halt: true });
_('email', { fn: function fn(val) {
        return !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    } });
_('number', { fn: function fn(val) {
        return !val || !isNaN(parseFloat(val));
    }, priority: 2 });
_('integer', { fn: function fn(val) {
        return val && /^\d+$/.test(val);
    } });
_('minlength', { fn: function fn(val, length) {
        return !val || val.length >= parseInt(length);
    } });
_('maxlength', { fn: function fn(val, length) {
        return !val || val.length <= parseInt(length);
    } });
_('min', { fn: function fn(val, limit) {
        return !val || (this.type === 'checkbox' ? groupedElemCount(this) >= parseInt(limit) : parseFloat(val) >= parseFloat(limit));
    } });
_('max', { fn: function fn(val, limit) {
        return !val || (this.type === 'checkbox' ? groupedElemCount(this) <= parseInt(limit) : parseFloat(val) <= parseFloat(limit));
    } });
_('pattern', { fn: function fn(val, pattern) {
        var m = pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));return !val || new RegExp(m[1], m[2]).test(val);
    } });

function Pristine(form, config, live) {

    var self = this;

    init(form, config, live);

    function init(form, config, live) {

        form.setAttribute("novalidate", "true");

        self.form = form;
        self.config = mergeConfig(config || {}, defaultConfig);
        self.live = !(live === false);
        self.fields = Array.from(form.querySelectorAll(SELECTOR)).map(function (input) {

            var fns = [];
            var params = {};
            var messages = {};

            [].forEach.call(input.attributes, function (attr) {
                if (/^data-pristine-/.test(attr.name)) {
                    var name = attr.name.substr(14);
                    if (name.endsWith('-message')) {
                        messages[name.slice(0, name.length - 8)] = attr.value;
                        return;
                    }
                    if (name === 'type') name = attr.value;
                    _addValidatorToField(fns, params, name, attr.value);
                } else if (~ALLOWED_ATTRIBUTES.indexOf(attr.name)) {
                    _addValidatorToField(fns, params, attr.name, attr.value);
                } else if (attr.name === 'type') {
                    _addValidatorToField(fns, params, attr.value);
                }
            });

            fns.sort(function (a, b) {
                return b.priority - a.priority;
            });

            self.live && input.addEventListener(!~['radio', 'checkbox'].indexOf(input.getAttribute('type')) ? 'input' : 'change', function (e) {
                self.validate(e.target);
            }.bind(self));

            return input.pristine = { input: input, validators: fns, params: params, messages: messages, self: self };
        }.bind(self));
    }

    function _addValidatorToField(fns, params, name, value) {
        var validator = validators[name];
        if (validator) {
            fns.push(validator);
            if (value) {
                var valueParams = value.split(',');
                valueParams.unshift(null); // placeholder for input's value
                params[name] = valueParams;
            }
        }
    }

    /***
     * Checks whether the form/input elements are valid
     * @param input => input element(s) or a jquery selector, null for full form validation
     * @param silent => do not show error messages, just return true/false
     * @returns {boolean} return true when valid false otherwise
     */
    self.validate = function (input, silent) {
        silent = input && silent === true || input === true;
        var fields = self.fields;
        if (input !== true && input !== false) {
            if (input instanceof HTMLElement) {
                fields = [input.pristine];
            } else if (input instanceof NodeList || input instanceof (window.$ || Array) || input instanceof Array) {
                fields = Array.from(input).map(function (el) {
                    return el.pristine;
                });
            }
        }

        var valid = true;

        for (var i in fields) {
            var field = fields[i];
            if (_validateField(field)) {
                !silent && _showSuccess(field);
            } else {
                valid = false;
                !silent && _showError(field);
            }
        }
        return valid;
    };

    /***
     * Get errors of a specific field or the whole form
     * @param input
     * @returns {Array|*}
     */
    self.getErrors = function (input) {
        if (!input) {
            var erroneousFields = [];
            for (var i = 0; i < self.fields.length; i++) {
                var field = self.fields[i];
                if (field.errors.length) {
                    erroneousFields.push({ input: field.input, errors: field.errors });
                }
            }
            return erroneousFields;
        }
        return input.length ? input[0].pristine.errors : input.pristine.errors;
    };

    /***
     * Validates a single field, all validator functions are called and error messages are generated
     * when a validator fails
     * @param field
     * @returns {boolean}
     * @private
     */
    function _validateField(field) {
        var errors = [];
        var valid = true;
        for (var i in field.validators) {
            var validator = field.validators[i];
            var params = field.params[validator.name] ? field.params[validator.name] : [];
            params[0] = field.input.value;
            if (!validator.fn.apply(field.input, params)) {
                valid = false;
                var error = field.messages[validator.name] || validator.msg;
                errors.push(tmpl.apply(error, params));
                if (validator.halt === true) {
                    break;
                }
            }
        }
        field.errors = errors;
        return valid;
    }

    /***
     *
     * @param elem => The dom element where the validator is applied to
     * @param fn => validator function
     * @param msg => message to show when validation fails. Supports templating. ${0} for the input's value, ${1} and
     * so on are for the attribute values
     * @param priority => priority of the validator function, higher valued function gets called first.
     * @param halt => whether validation should stop for this field after current validation function
     */
    self.addValidator = function (elem, fn, msg, priority, halt) {
        if (elem instanceof HTMLElement) {
            elem.pristine.validators.push({ fn: fn, msg: msg, priority: priority, halt: halt });
            elem.pristine.validators.sort(function (a, b) {
                return b.priority - a.priority;
            });
        } else {
            console.warn("The parameter elem must be a dom element");
        }
    };

    /***
     * An utility function that returns a 2-element array, first one is the element where error/success class is
     * applied. 2nd one is the element where error message is displayed. 2nd element is created if doesn't exist and cached.
     * @param field
     * @returns {*}
     * @private
     */
    function _getErrorElements(field) {
        if (field.errorElements) {
            return field.errorElements;
        }
        var errorClassElement = findAncestor(field.input, self.config.classTo);
        var errorTextParent = null,
            errorTextElement = null;
        if (self.config.classTo === self.config.errorTextParent) {
            errorTextParent = errorClassElement;
        } else {
            errorTextParent = errorClassElement.querySelector(self.errorTextParent);
        }
        if (errorTextParent) {
            errorTextElement = errorTextParent.querySelector('.' + PRISTINE_ERROR);
            if (!errorTextElement) {
                errorTextElement = document.createElement(self.config.errorTextTag);
                errorTextElement.className = PRISTINE_ERROR + ' ' + self.config.errorTextClass;
                errorTextParent.appendChild(errorTextElement);
                errorTextElement.pristineDisplay = errorTextElement.style.display;
            }
        }
        return field.errorElements = [errorClassElement, errorTextElement];
    }

    function _showError(field) {
        var errorElements = _getErrorElements(field);
        var errorClassElement = errorElements[0],
            errorTextElement = errorElements[1];

        if (errorClassElement) {
            errorClassElement.classList.remove(self.config.successClass);
            errorClassElement.classList.add(self.config.errorClass);
        }
        if (errorTextElement) {
            errorTextElement.innerHTML = field.errors.join('<br/>');
            errorTextElement.style.display = errorTextElement.pristineDisplay || '';
        }
    }

    /***
     * Adds error to a specific field
     * @param input
     * @param error
     */
    self.addError = function (input, error) {
        input = input.length ? input[0] : input;
        input.pristine.errors.push(error);
        _showError(input.pristine);
    };

    function _removeError(field) {
        var errorElements = _getErrorElements(field);
        var errorClassElement = errorElements[0],
            errorTextElement = errorElements[1];
        if (errorClassElement) {
            // IE > 9 doesn't support multiple class removal
            errorClassElement.classList.remove(self.config.errorClass);
            errorClassElement.classList.remove(self.config.successClass);
        }
        if (errorTextElement) {
            errorTextElement.innerHTML = '';
            errorTextElement.style.display = 'none';
        }
        return errorElements;
    }

    function _showSuccess(field) {
        var errorClassElement = _removeError(field)[0];
        errorClassElement && errorClassElement.classList.add(self.config.successClass);
    }

    /***
     * Resets the errors
     */
    self.reset = function () {
        for (var i in self.fields) {
            self.fields[i].errorElements = null;
        }
        Array.from(self.form.querySelectorAll('.' + PRISTINE_ERROR)).map(function (elem) {
            elem.parentNode.removeChild(elem);
        });
        Array.from(self.form.querySelectorAll('.' + self.config.classTo)).map(function (elem) {
            elem.classList.remove(self.config.successClass);
            elem.classList.remove(self.config.errorClass);
        });
    };

    /***
     * Resets the errors and deletes all pristine fields
     */
    self.destroy = function () {
        self.reset();
        self.fields.forEach(function (field) {
            delete field.input.pristine;
        });
        self.fields = [];
    };

    self.setGlobalConfig = function (config) {
        defaultConfig = config;
    };

    return self;
}

/***
 *
 * @param name => Name of the global validator
 * @param fn => validator function
 * @param msg => message to show when validation fails. Supports templating. ${0} for the input's value, ${1} and
 * so on are for the attribute values
 * @param priority => priority of the validator function, higher valued function gets called first.
 * @param halt => whether validation should stop for this field after current validation function
 */
Pristine.addValidator = function (name, fn, msg, priority, halt) {
    _(name, { fn: fn, msg: msg, priority: priority, halt: halt });
};

return Pristine;

})));
