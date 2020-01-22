const math = require('mathjs');

// let treePath = [];


class Quantity {
	constructor (name, unit, value, formula, parents) {
		this.name = name;
		this.unit = unit;
		this.value = value;
		this.formula = formula;
		this.parents = parents;
	};

	cancalculateAndSetValue = () => {
		for (var i in this.formula) {
			if (this.formula[i].allSubQuantitiesKnown()) { return true; }
		}
		return false;
	}
}

class Parent {
	constructor (quantity, formulaID, operator) {
		this.quantity = quantity;
		this.formulaID = formulaID;
		this.operator = operator;
	}
	getConnectingFormula = () => { return eval(this.quantity).formula[this.formulaID]; }
}

class MulFormula {
	constructor (parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	getOperator = () => { return 'mul'; }
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) { count++; }
		}
		return count;
	}
	getUnknownSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) { return this.subQuantities[i]; }
		}
	}
	calculateAndSetValue = (unknownQuantity) => {

		this.parentQuantity = eval(this.parentQuantity);

		if (unknownQuantity == this.parentQuantity) {
			let calc = 1;
			for (var i in this.subQuantities) {
				calc *= this.subQuantities[i].value;
			}
			unknownQuantity.value =  calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != null) {
					calc /= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value =  calc;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der MulFormula vorhanden.')
		}
	}
	// setParentValue = (parentValue) => {
	// 	eval(this.parentQuantity).value = parentValue;
	// }
}

class AddFormula {
	constructor (parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	getOperator = () => { return 'add'; }
	unknownSubQuantities = () => {
		let count = 0;
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) { count++; }
		}
		return count;
	}
	getUnknwonSubQuantity = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) { return this.subQuantities[i]; }
		}
	}
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == this.parentQuantity) {
			let calc = 0;
			for (var i in this.subQuantities) {
				calc += this.subQuantities[i].value;
			}
			unknownQuantity.value =  calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != null) {
					calc -= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value =  calc;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der AddFormula vorhanden.')
		}
	}
	// setParentValue = (parentValue) => {
	// 	this.parentQuantity.value = parentValue;
	// }
}

class DivFormula {
	constructor (parentQuantity, dividendQuantity, divisorQuantity) {
		this.parentQuantity = parentQuantity;
		this.dividendQuantity = dividendQuantity;
		this.divisorQuantity = divisorQuantity;
	}
	getOperator = () => { return 'div'; }
	unknownSubQuantities = () => {
		let count = 0;
		if (this.dividendQuantity.value === null) { count++; }
		if (this.divisorQuantity.value === null) { count++; }
		return count;
	}
	getUnknwonSubQuantity = () => {
		if (this.dividendQuantity.value === null) { return this.dividendQuantity; }
		if (this.divisorQuantity.value === null) { return this.divisorQuantity; }
	}
	calculateAndSetValue = (unknownQuantity) => {
		if (unknownQuantity == this.parentQuantity) {
			unknownQuantity.value = eval(this.dividendQuantity).value / eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.dividendQuantity) {
			unknownQuantity.value = eval(this.parentQuantity).value * eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.divisorQuantity) {
			unknownQuantity.value =  eval(this.parentQuantity).value / eval(this.dividendQuantity).value;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der DivFormula vorhanden.')
		}
	}
	// setParentValue = (parentValue) => {
	// 	this.parentQuantity.value = parentValue;
	// }
}

let W_el, F_el, E_el, l, q, mgs, m, g, s;


{ 	m = new Quantity (  // Quantities
		'Masse',
		'kg',
		null,
		[],
		[new Parent('mgs', 0, 'mul')]
	);

	g = new Quantity (
		'Fallbeschleunigung',
		'm/s²',
		null,
		[],
		[new Parent('mgs', 0, 'mul')]
	);
		
	s = new Quantity (
		'Strecke',
		'm',
		null,
		[],
		[new Parent('mgs', 0, 'mul')]
	);

	l = new Quantity (
		'Länge', 
		'm',
		null,
		[],
		[new Parent('F_el', 0, 'div2')]
	);

	q = new Quantity (
		'',
		'',
		null,
		[],
		[new Parent('F_el', 1, 'mul')]
	);
		
	mgs = new Quantity (
		'm * g * s',
		null,
		null,
		[new MulFormula('mgs', [m, g, s])],
		[new Parent('F_el', 0, 'div1')]
	);

	E_el = new Quantity (
		'Elektrische Feldstärke',
		'N/C oder V/m',
		null,
		[],
		[new Parent('F_el', 1, 'mul')]
	);

	F_el = new Quantity (
		'elektrishce Feldkraft',
		'N',
		null,
		[new DivFormula('F_el', mgs, l), new MulFormula('F_el', [E_el, q])],
		[new Parent('W_el', 0)]
	);

	W_el = new Quantity (
		'elektrische Energie',
		'J',
		null,
		[new MulFormula('W_el', [F_el, s])],
		[]	
	);
}
	

function assignValues(given) {
	for (var i in given) {
		given[i][0].value = given[i][1];
	}
}


function getSolution(given, searched) {
	
	for (var i in given) {
	
		if (given[i].formula != []) { 
		
			for (var j in given[i][0].formula) { console.log(given[i][0].formula);

				let givenFormula = given[i][0].formula[j];
				let unknownSubQuantity = givenFormula.getUnknownSubQuantity();

				if (givenFormula.unknownSubQuantities() == 1) {
										
					givenFormula.calculateAndSetValue(unknownSubQuantity);
					givenArr.push([unknownSubQuantity, unknownSubQuantity.value]);

					if (unknownSubQuantity == searched) {
						return searched.value; 
					}
				}
			}
		} else {

			if (given[i].parents != []) {

				let givenParents = given[i].parents;
				
				for (var j in givenParents) {

					let givenParentFormula = givenParents[j].getConnectingFormula;
					let unknownSubQuantity = givenParentsFormula.getUnknownSubQuantity();
					
					if (givenParents[j].quantity.value != null) {

						if (givenParentFormula.unknownSubQuantities() == 1) {

							givenParentFormula.calculateAndSetValue(unknownSubQuantity);
							givenArr.push([unknownSubQuantity, unknownSubQuantity.value]);

							if (unknownSubQuantity == searched) {
								return searched.value;
							}
						}
					} else {

						if (givenParentFormula.unknownSubQuantities() == 0) {

							givenParentFormula.calculateAndSetValue(givenParentFormula.parentQuantity);
							givenArr.push([givenParentFormula.parentQuantity, givenParentFormula.parentQuantity.value]);

							if (givenParentFormula.parentQuantity == searched) {
								return searched.value;
							}
						}
					}
				}
			}
		}
	}
}


// console.log('solution: ' + getSolution([[m, 2], [g, 3], [s, - 4]], mgs));


let givenArr = [[m, 2], [g, 3], [s, 4], [F_el, 5]];
let searched = l;

assignValues(givenArr);

console.log('solution: ' + getSolution(givenArr, searched));