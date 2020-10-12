import Pristine from "../src/pristine";

describe('Locale', function() {

    beforeEach(() => {
        const fixture =
            `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
                        <input id="input" type="text" required class="form-control" />
                        <input id="input-custom" type="text" data-pristine-required-message="requires a value" required class="form-control" />
                        <input id="input-custom-locale-en" type="text" data-pristine-required-message-en="English  message" required class="form-control" />
                        <input id="input-custom-locale-bn" type="text" data-pristine-required-message-bn="বাংলা মেসেজ" required class="form-control" />
                        <input id="input-custom-locale-without-message" type="text" data-pristine-first-cap="true" class="form-control" />
					</div>
			 </form>
			</div>`;

        document.body.insertAdjacentHTML('afterbegin', fixture);
        Pristine.setLocale("en");
    });

    afterEach(() => {
        document.body.removeChild(document.getElementById('fixture'));
    });

    it(`should show default error message`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input")
        let pristine = new Pristine(form);

        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("This field is required");

    });

    it(`should show custom error message`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input-custom")
        let pristine = new Pristine(form);

        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("requires a value");

    });

    it(`should show en error message when locale not set`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input-custom-locale-en")
        let pristine = new Pristine(form);

        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("English  message");

    });

    it(`should show error message based on locale`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input")

        Pristine.addMessages("bn", {
            required: "ভ্যালু লাগবেই"
        })

        Pristine.setLocale("bn");

        let pristine = new Pristine(form);

        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("ভ্যালু লাগবেই");

    });

    it(`should show error message from attribute based on locale`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input-custom-locale-bn")

        Pristine.setLocale("bn");

        let pristine = new Pristine(form);

        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("বাংলা মেসেজ");

    });

    it(`Global validators should use globally added messages when not specified`, () => {

        let form = document.getElementById("fixture")
        let input = document.getElementById("input-custom-locale-without-message")

        Pristine.addValidator("first-cap", (val) => val[0] === val[0].toUpperCase(), null, 1, false);

        Pristine.addMessages('en', {
            'first-cap': "First character should be capitalized"
        })

        let pristine = new Pristine(form);
        input.value = "first";
        expect(pristine.validate(input)).toBe(false);

        expect(pristine.getErrors(input).length).toBe(1);
        expect(pristine.getErrors(input)[0]).toBe("First character should be capitalized");
    });
});
