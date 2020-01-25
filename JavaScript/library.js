const math = require('mathjs');
// hallo das ist eine änderung.

class Given {
	constructor(quantity, value) {
		this.quantity = quantity;
		this.value = value;
	}
}

class Quantity {
	constructor(symbol, name, unit, value, children, parents) {
		this.symbol = symbol;
		this.name = name;
		this.unit = unit;
		this.value = value;
		this.children = children;
		this.parents = parents;
	}
}

class Parent {
	constructor(quantity, formulaID) {
		this.quantity = quantity;
		this.formulaID = formulaID;
	}

	getConnectingFormula = () => {
		return eval(this.quantity).children[this.formulaID];
	};
}

class MulFormula {
	constructor(parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) {
				count++;
			}
		}
		return count;
	};
	getUnknownSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) {
				return this.subQuantities[i];
			}
		}
	};
	calculateAndSetValue = (unknownQuantity) => {
		this.parentQuantity = eval(this.parentQuantity);
		if (unknownQuantity == this.parentQuantity) {
			let calc = 1;
			for (var i in this.subQuantities) {
				calc *= this.subQuantities[i].value;
			}
			unknownQuantity.value = calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != undefined) {
					calc /= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value = calc;
		} else {
			throw new Error(
				'Die angegebene Größe ' +
					unknownQuantity.name +
					' ist nicht in der MulFormula ' +
					this.parentQuantity +
					' vorhanden.'
			);
		}
	};
}

class AddFormula {
	constructor(parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) {
				count++;
			}
		}
		return count;
	};
	getUnknownSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) {
				return this.subQuantities[i];
			}
		}
	};
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == eval(this.parentQuantity)) {
			let calc = 0;
			for (var i in this.subQuantities) {
				calc += this.subQuantities[i].value;
			}
			unknownQuantity.value = calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != undefined) {
					calc -= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value = calc;
		} else {
			throw new Error(
				'Die angegebene Größe ' +
					unknownQuantity.name +
					' ist nicht in der AddFormula ' +
					this.parentQuantity +
					' vorhanden.'
			);
		}
	};
}

class DivFormula {
	constructor(parentQuantity, dividendQuantity, divisorQuantity) {
		this.parentQuantity = parentQuantity;
		this.dividendQuantity = dividendQuantity;
		this.divisorQuantity = divisorQuantity;
		this.subQuantities = [dividendQuantity, divisorQuantity];
	}
	unknownSubQuantities = () => {
		let count = 0;
		if (this.dividendQuantity.value == undefined) {
			count++;
		}
		if (this.divisorQuantity.value == undefined) {
			count++;
		}
		return count;
	};
	getUnknownSubQuantity = () => {
		if (this.dividendQuantity.value == undefined) {
			return this.dividendQuantity;
		}
		if (this.divisorQuantity.value == undefined) {
			return this.divisorQuantity;
		}
	};
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == eval(this.parentQuantity)) {
			unknownQuantity.value =
				eval(this.dividendQuantity).value / eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.dividendQuantity) {
			unknownQuantity.value =
				eval(this.parentQuantity).value * eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.divisorQuantity) {
			unknownQuantity.value =
				eval(this.dividendQuantity).value / eval(this.parentQuantity).value;
		} else {
			throw new Error(
				'Die angegebene Größe ' +
					unknownQuantity.name +
					' ist nicht in der DivFormula ' +
					this.parentQuantity +
					' vorhanden.'
			);
		}
	};
}

class PowFormula {
	constructor(parentQuantity, base, power) {
		this.parentQuantity = parentQuantity;
		this.base = base;
		this.power = power;
	}
	unknownSubQuantities = () => {
		if (this.base === undefined && this.power === undefined) {
			return 2;
		}
		if (this.base === undefined || this.power === undefined) {
			return 1;
		}
		return 0;
	};
	getUnknownSubQuantity = () => {
		if (this.base === undefined) {
			return this.base;
		}
		if (this.power === undefined) {
			return this.power;
		}
	};
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == eval(this.parentQuantity)) {
			unknownQuantity.value = Math.pow(this.base.value, this.power.value);
		} else if (unknownQuantity == this.base) {
			unknownQuantity.value = Math.pow(
				eval(this.parentQuantity).value,
				1 / this.power.value
			);
		} else if (unknownQuantity == this.pow) {
			unknownQuantity.value ==
				Math.log(eval(this.parentQuantity).value) / Math.log(this.base.value);
		} else {
			throw new Error(
				'Die angegebene Größe ' +
					unknownQuantity.name +
					' ist nicht in der PowFormula ' +
					this.parentQuantity +
					' vorhanden.'
			);
		}
	};
}

let F_el, E_el, l, q, mgs, m, g, s;

{
	c0 = new Quantity('c0', '0', undefined, 0, [], []);

	c1 = new Quantity('c1', '1', undefined, 1, [], []);

	c0_5 = new Quantity(
		'c0_5',
		'0.5',
		undefined,
		0.5,
		[],
		[new Parent('W_kin', 0)]
	);

	c2 = new Quantity('c2', '2', undefined, 2, [], [new Parent('vv', 0)]);
	t = new Quantity('t', 'Zeit', 's', undefined, [], [new Parent('v', 0)]);
	s = new Quantity('s', 'Strecke', 'm', undefined, [], [new Parent('mgs', 0)]);

	v = new Quantity(
		'v', // symbol (always the same as object name)
		'Geschwindigkeit', // name
		'm/s', // unit
		undefined, // value
		[new DivFormula('v', s, t)], // children( aka children)
		[new Parent('vv', 0)] // parents
	);

	vv = new Quantity(
		'vv',
		'v * v',
		undefined,
		undefined,
		[new PowFormula('vv', v, c2)],
		[new Parent('W_kin', 0)]
	);

	m = new Quantity('m', 'Masse', 'kg', undefined, [], [new Parent('mgs', 0)]);

	g = new Quantity(
		'g',
		'Fallbeschleunigung',
		'm/s²',
		undefined,
		[],
		[new Parent('mgs', 0)]
	);

	l = new Quantity('l', 'Länge', 'm', undefined, [], [new Parent('F_el', 0)]);

	Q = new Quantity(
		'Q',
		'elektrische Ladung',
		'C',
		undefined,
		[],
		[new Parent('F_el', 1), new Parent('W_el', 1)]
	);

	U = new Quantity(
		'U',
		'elektrische Spannung',
		'V',
		undefined,
		[],
		[new Parent('W_el', 1)]
	);

	mgs = new Quantity(
		'mgs',
		'm * g * s',
		undefined,
		undefined,
		[new MulFormula('mgs', [m, g, s])],
		[new Parent('F_el', 0)]
	);

	E_el = new Quantity(
		'E_el',
		'Elektrische Feldstärke',
		'N/C oder V/m',
		undefined,
		[],
		[new Parent('F_el', 1)]
	);

	F_el = new Quantity(
		'F_el',
		'elektrishce Feldkraft',
		'N',
		undefined,
		[new DivFormula('F_el', mgs, l), new MulFormula('F_el', [E_el, Q])],
		[new Parent('W_el', 0)]
	);

	W_el = new Quantity(
		'W_el',
		'elektrische Energie',
		'J',
		undefined,
		[new MulFormula('W_el', [F_el, s]), new MulFormula('W_el', [Q, U])],
		[]
	);

	W_kin = new Quantity(
		'W_kin',
		'kinetische Energie',
		'J',
		undefined,
		[new MulFormula('W_kin', [c0_5, m, vv])],
		[]
	);
}

function assignValues(given) {
	for (var i in given) {
		given[i].quantity.value = given[i].value;
	}
}

function assignEquations(equations) {
	for (var i in equations) {
		let children = eval(equations[i].parentQuantity).children;
		children.push(equations[i]);
		givenArr.push(new Given(eval(equations[i].parentQuantity), undefined));
		let subQuantities = equations[i].subQuantities;
		for (var j in subQuantities) {
			subQuantities[j].parents.push(
				new Parent(equations[i].parentQuantity, children.length - 1)
			);
			givenArr.push(new Given(subQuantities[j], subQuantities[j].value));
		}
	}
}

function getSolution(given, searched) {
	for (i = 0; i < given.length; i++) {
		// for each given
		if (given[i].quantity.parents.length > 0) {
			// if given has parents
			let givenParents = given[i].quantity.parents;
			for (var j in givenParents) {
				// for each parent of given
				let givenParentFormula = givenParents[j].getConnectingFormula();
				if (eval(givenParentFormula.parentQuantity).value != undefined) {
					// if the parent is known
					if (givenParentFormula.unknownSubQuantities() == 1) {
						// if there is only one unknown subQuantity in the formula
						let unknownSubQuantity = givenParentFormula.getUnknownSubQuantity();
						givenParentFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
						givenArr.push(
							new Given(unknownSubQuantity, unknownSubQuantity.value)
						); // add new known to givenArr
						if (unknownSubQuantity == searched) {
							// if the calculated Quantity is searched
							return unknownSubQuantity; // return searched subQuantity
						}
					}
				} else {
					// if the parent is unknown
					if (givenParentFormula.unknownSubQuantities() == 0) {
						// if all subQuantities of parentFormula are known
						let unknownParentQuantity = eval(givenParentFormula.parentQuantity);
						givenParentFormula.calculateAndSetValue(unknownParentQuantity); // calc and set value in quantity
						givenArr.push(
							new Given(unknownParentQuantity, unknownParentQuantity.value)
						); // add new known to givenArr
						if (unknownParentQuantity == searched) {
							// if the calculated Quantity is searched
							return unknownParentQuantity; // return searched subQuantity
						}
					}
				}
			}
		}
		if (given[i].quantity.children.length > 0) {
			// if given has children
			for (var j in given[i].quantity.children) {
				// for each formula of given
				let givenFormula = given[i].quantity.children[j];
				if (givenFormula.unknownSubQuantities() == 1) {
					// if givenFormula has only one unknown subQuantity
					let unknownSubQuantity = givenFormula.getUnknownSubQuantity();
					givenFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
					givenArr.push(
						new Given(unknownSubQuantity, unknownSubQuantity.value)
					); // add new known to givenArr
					if (unknownSubQuantity == searched) {
						// if the calculated Quantity is searched
						return unknownSubQuantity; // return searched subQuantity
					}
				}
			}
		}
	}
}

let givenArr = [new Given(m, 2), new Given(U, 3), new Given(Q, 4)];
let eqtArr = [
	new AddFormula('W_kin', [c0, W_el]),
	new AddFormula('W_el', [c0, W_kin])
];
let searched = v;

assignValues(givenArr);
assignEquations(eqtArr);

let prev = givenArr.length,
	curr = 0;

function run(given, searched) {
	if (prev == curr) return 'this problem is gay';
	prev = given.length;

	let solution = getSolution(given, searched);
	if (solution === Infinity || isNaN(solution))
		return 'who divided your IQ by zero?';

	if (solution !== undefined) {
		return (
			'solution: ' +
			solution.symbol +
			' = ' +
			solution.value +
			' ' +
			solution.unit
		);
	}
	curr = given.length;
	return run(given, searched);
}

console.log(run(givenArr, searched));
