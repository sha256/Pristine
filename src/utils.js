export function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

export function tmpl(o) {
    return this.replace(/\${([^{}]*)}/g, (a, b) => arguments[b]);
}

export function groupedElemCount(input) {
    return input.pristine.self.form.querySelectorAll('input[name="' + input.getAttribute('name') + '"]:checked').length;
}

export function mergeConfig(obj1, obj2) {
    for (let attr in obj2) {
    		if (!(attr in obj1)) {
        	obj1[attr] = obj2[attr];
        }
    }
    return obj1;
}

