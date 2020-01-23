const math = require('mathjs');

// let treePath = [];

class Given {
	constructor (quantity, value) {
		this.quantity = quantity;
		this.value = value;
	};
}

class Quantity {
	constructor (name, unit, value, formulas, parents) {
		this.name = name;
		this.unit = unit;
		this.value = value;
		this.formulas = formulas;
		this.parents = parents;
	};
}

class Parent {
	constructor (quantity, formulaID, operator) {
		this.quantity = quantity;
		this.formulaID = formulaID;
		this.operator = operator;
	}

	getConnectingFormula = () => { return eval(this.quantity).formulas[this.formulaID]; }
}

class MulFormula {
	constructor (parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) { count++; }
		}
		return count;
	}
	getUnknownSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) { return this.subQuantities[i]; }
		}
	}
	calculateAndSetValue = (unknownQuantity) => {

		this.parentQuantity = eval(this.parentQuantity);

		if (unknownQuantity == eval(this.parentQuantity)) {
			let calc = 1;
			for (var i in this.subQuantities) {
				calc *= this.subQuantities[i].value;
			}
			unknownQuantity.value =  calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = eval(this.parentQuantity).value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != undefined) {
					calc /= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value =  calc;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der MulFormula ' + this.parentQuantity + ' vorhanden.')
		}
	}
}

class AddFormula {
	constructor (parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) { count++; }
		}
		return count;
	}
	getUnknownSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value == undefined) { return this.subQuantities[i]; }
		}
	}
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
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der AddFormula ' + this.parentQuantity + ' vorhanden.')
		}
	}
}

class DivFormula {
	constructor (parentQuantity, dividendQuantity, divisorQuantity) {
		this.parentQuantity = parentQuantity;
		this.dividendQuantity = dividendQuantity;
		this.divisorQuantity = divisorQuantity;
	}
	unknownSubQuantities = () => {
		let count = 0;
		if (this.dividendQuantity.value == undefined) { count++; }
		if (this.divisorQuantity.value == undefined) { count++; }
		return count;
	}
	getUnknownSubQuantity = () => {
		if (this.dividendQuantity.value == undefined) { return this.dividendQuantity; }
		if (this.divisorQuantity.value == undefined) { return this.divisorQuantity; }
	}
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == eval(this.parentQuantity)) {
			unknownQuantity.value = eval(this.dividendQuantity).value / eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.dividendQuantity) {
			unknownQuantity.value = eval(this.parentQuantity).value * eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.divisorQuantity) {
			unknownQuantity.value = eval(this.dividendQuantity).value / eval(this.parentQuantity).value;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der DivFormula ' + this.parentQuantity + ' vorhanden.')
		}
	}
}

class PowFormula {
	constructor(parentQuantity, base, power) {
		this.parentQuantity = parentQuantity;
		this.base = base;
		this.power = power;
	}
	unknownSubQuantities = () => {
		if (this.base === undefined && this.power === undefined) { return 2; }
		if (this.base === undefined || this.power === undefined) { return 1; }
		return 0;
	}
	getUnknownSubQuantity = () => {
		if (this.base === undefined) { return this.base; }
		if (this.power === undefined) { return this.power; }
	}
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == eval(this.parentQuantity)) {
			unknownQuantity.value = Math.pow(this.base.value, this.power.value);
		} else if (unknownQuantity == this.base) {
			unknownQuantity.value = Math.pow(eval(this.parentQuantity).value, 1 / this.power.value);
		} else if (unknownQuantity == this.pow) {
			unknownQuantity.value == Math.log(eval(this.parentQuantity).value) / Math.log(this.base.value);
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der PowFormula ' + this.parentQuantity + ' vorhanden.')
		}
	}
}

let W_el, F_el, E_el, l, q, mgs, m, g, s;


{ 	m = new Quantity (  // Quantities
		'Masse',
		'kg',
		undefined,
		[],
		[new Parent('mgs', 0, 'mul')]
	);

	g = new Quantity (
		'Fallbeschleunigung',
		'm/s²',
		undefined,
		[],
		[new Parent('mgs', 0, 'mul')]
	);
		
	s = new Quantity (
		'Strecke',
		'm',
		undefined,
		[],
		[new Parent('mgs', 0, 'mul')]
	);

	l = new Quantity (
		'Länge', 
		'm',
		undefined,
		[],
		[new Parent('F_el', 0, 'div2')]
	);

	q = new Quantity (
		'',
		'',
		undefined,
		[],
		[new Parent('F_el', 1, 'mul')]
	);
		
	mgs = new Quantity (
		'm * g * s',
		undefined,
		undefined,
		[new MulFormula('mgs', [m, g, s])],
		[new Parent('F_el', 0, 'div1')]
	);

	E_el = new Quantity (
		'Elektrische Feldstärke',
		'N/C oder V/m',
		undefined,
		[],
		[new Parent('F_el', 1, 'mul')]
	);

	F_el = new Quantity (
		'elektrishce Feldkraft',
		'N',
		undefined,
		[new DivFormula('F_el', mgs, l), new MulFormula('F_el', [E_el, q])],
		[new Parent('W_el', 0, 'mul')]
	);

	W_el = new Quantity (
		'elektrische Energie',
		'J',
		undefined,
		[new MulFormula('W_el', [F_el, s])],
		[]	
	);
}
	
function assignValues(given) {
	for (var i in given) {
		given[i].quantity.value = given[i].value;
	}
}

function getSolution(given, searched) {

	for (i = 0; i < givenArr.length; i++) { // for every given

		if (given[i].quantity.parents.length > 0) { // if given has parents
			
			let givenParents = given[i].quantity.parents;
			
			for (var j in givenParents) { // for every parent of given
				
				let givenParentFormula = givenParents[j].getConnectingFormula();
				
				if (eval(givenParentFormula.parentQuantity).value != undefined) { // if the parent is known
					
					if (givenParentFormula.unknownSubQuantities() == 1) { // if there is only one unknown subQuantity in the formula 

						let unknownSubQuantity = givenParentFormula.getUnknownSubQuantity();
						
						givenParentFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
						givenArr.push(new Given(unknownSubQuantity, unknownSubQuantity.value)); // add new known to givenArr
						
						if (unknownSubQuantity == searched) { // if the calculated Quantity is searched
							return unknownSubQuantity.value; // return searched value
						}
					}
				} else { // if the parent is unknown
					
					if (givenParentFormula.unknownSubQuantities() == 0) { // if all subQuantities of parentFormula are known
						
						let unknownParentQuantity = eval(givenParentFormula.parentQuantity);
						
						givenParentFormula.calculateAndSetValue(unknownParentQuantity); // calc and set value in quantity
						givenArr.push(new Given(unknownParentQuantity, unknownParentQuantity.value)); // add new known to givenArr
						
						if (unknownParentQuantity == searched) { // if the calculated Quantity is searched
							return unknownParentQuantity.value; // return searched value
						}
					}
				}
			}
		}

		if (given[i].quantity.formulas.length > 0) { // if given has formulas
			
			for (var j in given[i].quantity.formulas) { // for all formulas of given
				
				let givenFormula = given[i].quantity.formulas[j];
				
				if (givenFormula.unknownSubQuantities() == 1) { // if given has only one unknown subQuantity
					
					let unknownSubQuantity = givenFormula.getUnknownSubQuantity();
					
					givenFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
					givenArr.push(new Given(unknownSubQuantity, unknownSubQuantity.value)); // add new known to givenArr
					
					if (unknownSubQuantity == searched) { // if the calculated Quantity is searched
						return unknownSubQuantity.value; // return searched value
					}
				}
			}
		}
	}
}


let givenArr = [new Given(m, 2), new Given(g, 3), new Given(W_el, 4), new Given(F_el, 5)];
let searched = l;

assignValues(givenArr);

let prev = givenArr.length, curr = 0;

function run(given, searched) {
	if (prev == curr) { return 'this problem is gay'; }
	prev = given.length;
	let val = getSolution(given, searched);
	if (val === Infinity) { return 'who devided your IQ by zero?' }
	if (val !== undefined) { return 'solution: ' + val; }
	curr = given.length;
	return run(given, searched);
}

console.log(run(givenArr, searched));