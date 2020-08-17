import Pristine from "../src/pristine";

describe('Integrity', function() {

	beforeEach(() => {
		const fixture =
			`<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
							<input id="input" type="text" required class="form-control" />
					</div>
			 </form>
			</div>`;

		document.body.insertAdjacentHTML('afterbegin', fixture);
  });

	afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });


	it('should have no errors when validates to true', () => {

		let form = document.getElementById("fixture")
		let input = document.getElementById("input")
		let pristine = new Pristine(form);

		input.value = "some value";

		expect(pristine.validate()).toBe(true);
		expect(pristine.getErrors().length).toBe(0);

	});
/*
	it('should not show error when silently validating', () => {

	});

	it('should not proceed when halt is found', () => {

	});

	it('should clean up when called destroy', () => {

	});
	*/
});

