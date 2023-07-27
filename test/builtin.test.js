import Pristine from "../src/pristine";

describe('Required', function() {

  beforeEach(() => {
    const fixture =
      `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
            <input id="input" type="text" required class="form-control" />
            <textarea id="textarea" required class="form-control" ></textarea>
            <select id="select" required class="form-control">
              <option value="">-----</option>
              <option value="bangladesh">Bangladesh</option>
              <option value="usa">USA</option>
              <option value="canada">Canada</option>
            </select>
            
            <input id="checkbox" type="checkbox" name="future" required />
            <input id="ch2" type="checkbox" name="future" required />
            <input id="ch3" type="checkbox" name="future" required />
					</div>
			 </form>
			</div>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });

  for (let id of ["input", "textarea", "select"]){

    it(`should validate required attribute on ${id}`, () => {

      let form = document.getElementById("fixture")
      let input = document.getElementById(id)
      let pristine = new Pristine(form);

      expect(pristine.validate(input)).toBe(false);

      expect(pristine.getErrors(input).length).toBe(1);
      expect(pristine.getErrors(input)[0]).toBe("This field is required");

      input.value = "bangladesh";
      expect(pristine.validate(input)).toBe(true);

    });
  }

  it(`should validate required attribute on checkbox`, () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("checkbox")
    let pristine = new Pristine(form);

    expect(pristine.validate(input)).toBe(false);

    expect(pristine.getErrors(input).length).toBe(1);
    expect(pristine.getErrors(input)[0]).toBe("This field is required");

    input.checked = true
    expect(pristine.validate(input)).toBe(true);

    input.checked = false;
    expect(pristine.validate(input)).toBe(false);

    document.getElementById("checkbox").checked = true;
    expect(pristine.validate(input)).toBe(true);

  });
});

describe('Min max', function() {

  beforeEach(() => {
    const fixture =
      `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
            <input id="min-input" min="10" type="number" class="form-control" />
            <input id="max-input" max="100" type="number" class="form-control" />
            <input id="min-max-input" min="10" max="100" type="number" class="form-control" />
					</div>
			 </form>
			</div>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });


  it('should validate min (max) when empty', () => {

    let form = document.getElementById("fixture")
    let pristine = new Pristine(form);

    expect(pristine.validate()).toBe(true);

  });


  it('should validate min value', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("min-input")
    let pristine = new Pristine(form);

    input.value = 9;
    expect(pristine.validate()).toBe(false);
    expect(pristine.getErrors()[0].errors.length).toBe(1);

    input.value = 10;
    expect(pristine.validate()).toBe(true);

    input.value = 11;
    expect(pristine.validate()).toBe(true);

  });

  it('should validate the max value', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("max-input")
    let pristine = new Pristine(form);

    for (let item of [[99, true], [100, true], [101, false]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });


});

describe('Input types', function() {

  beforeEach(() => {
    const fixture =
      `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
            <input id="input-number" type="number" class="form-control" />
            <input id="input-email" type="email" class="form-control" />
            <input id="input-integer" data-pristine-type="integer" class="form-control" />
            <input id="input-pattern" pattern="/^\\d+\\.\\d{2,2}$/g" class="form-control" />
					</div>
			 </form>
			</div>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });


  it('should validate pattern input', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("input-pattern")
    let pristine = new Pristine(form);

    for (let item of [["22.2", false], ["20", false], ["text", false], ["22.22", true]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });


  it('should validate number input', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("input-number");
    let pristine = new Pristine(form);

    // text value does not actually set, because it's a number input. so the following is true

    for (let item of [[20, true], ["20", true], ["text", true]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });

  it('should validate integer input', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("input-integer");
    let pristine = new Pristine(form);

    for (let item of [[20, true], ["20", true], ["20.89", false], [20.89, false], ["text", false]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });

  it('should validate email input', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("input-email");
    let pristine = new Pristine(form);

    for (let item of [
      ["user@exampl.com", true],
      ["@example.com", false],
      ["user@example", false],
      ["a@x.x", false],
      ["a@x.xl", true],
      ["a+filter@x.xl", true],
      ["a b@c.cd", false],
    ]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }
  });

});

describe('Min max length', function() {

  beforeEach(() => {
    const fixture =
      `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
            <input id="min-length-input" minlength="3" type="text" class="form-control" />
            <input id="max-length-input" maxlength="5" type="text" class="form-control" />
					</div>
			 </form>
			</div>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });


  it('should validate minlength value', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("min-length-input")
    let pristine = new Pristine(form);

    for (let item of [["ab", false], ["abc", true], ["4len", true], ["20.89", true]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });

  it('should validate the maxlength value', () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("max-length-input")
    let pristine = new Pristine(form);

    for (let item of [["ab", true], ["12345", true], ["123456", false]]) {
      input.value = item[0];
      expect(pristine.validate(input, true)).toBe(item[1]);
    }

  });


});

