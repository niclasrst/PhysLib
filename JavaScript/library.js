const math = require('mathjs');

// let treePath = [];

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

	getOperator = () => { return 'mul'; }
	
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

		if (unknownQuantity == this.parentQuantity) {
			let calc = 1;
			for (var i in this.subQuantities) {
				calc *= this.subQuantities[i].value;
			}
			unknownQuantity.value =  calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
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
	getOperator = () => { return 'add'; }
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
		if (unknownQuantity == this.parentQuantity) {
			let calc = 0;
			for (var i in this.subQuantities) {
				calc += this.subQuantities[i].value;
			}
			unknownQuantity.value =  calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != undefined) {
					calc -= this.subQuantities[i].value;
				}
			}
			unknownQuantity.value =  calc;
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
	getOperator = () => { return 'div'; }
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
		if (unknownQuantity == this.parentQuantity) {
			unknownQuantity.value = eval(this.dividendQuantity).value / eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.dividendQuantity) {
			unknownQuantity.value = eval(this.parentQuantity).value * eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.divisorQuantity) {
			unknownQuantity.value =  eval(this.dividendQuantity).value / eval(this.parentQuantity).value;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der DivFormula ' + this.parentQuantity + ' vorhanden.')
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
		'Strecke', 										// name
		'm',			 										// unit
		undefined, 										// wert
		[],				 										// formulas
		[new Parent('mgs', 0, 'mul')] // parents
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
		given[i][0].value = given[i][1];
	}
}


function getSolution(given, searched) {

	for (i = 0; i < givenArr.length; i++) { // for every given
		
		console.log('given: ' + given[i][0].name);
		
		if (given[i][0].formulas.length == 0) { // if given does not have formulas
			
			if (given[i][0].parents.length > 0) { // if given has parents
				
				let givenParents = given[i][0].parents;
				
				for (var j in givenParents) { // for every parent of given
					
					let givenParentFormula = givenParents[j].getConnectingFormula(); // givenParentFormula = connectingFormula from parent to given
					
					if (eval(givenParentFormula.parentQuantity).value != undefined) { // if the parent is known
						
						if (givenParentFormula.unknownSubQuantities() == 1) { // if there is only one unknown subQuantity in the formula 
							
							let unknownSubQuantity = givenParentFormula.getUnknownSubQuantity();
							
							givenParentFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
							console.log('value: ' + unknownSubQuantity.value);
							givenArr.push([unknownSubQuantity, unknownSubQuantity.value]); // add new known to givenArr
							
							if (unknownSubQuantity == searched) { // if the calculated Quantity is searched
								// searchedNotFound = false;
								return searched.value; // return searched value
							}
						}
					} else { // if the parent is unknown
						
						if (givenParentFormula.unknownSubQuantities() == 0) { // if all subQuantities of parentFormula are known
							
							let unknownParentQuantity = eval(givenParentFormula.parentQuantity);
							
							givenParentFormula.calculateAndSetValue(unknownParentQuantity); // calc and set value in quantity
							console.log('value: ' + unknownSubQuantity.value);
							givenArr.push([unknownParentQuantity, unknownParentQuantity.value]); // add new known to givenArr
							
							if (unknownParentQuantity == searched) { // if the calculated Quantity is searched
								// searchedNotFound = false;
								return searched.value; // return searched value
							}
						}
					}
				}
			}
			
		} else { // if given has formulas
			
			for (var j in given[i][0].formulas) { // for all formulas of given
				
				let givenFormula = given[i][0].formulas[j];
				
				if (givenFormula.unknownSubQuantities() == 1) { // if given has only one unknown subQuantity
					
					let unknownSubQuantity = givenFormula.getUnknownSubQuantity();
					
					givenFormula.calculateAndSetValue(unknownSubQuantity); // calc and set value in Quantity
					console.log('value: ' + unknownSubQuantity.value);
					givenArr.push([unknownSubQuantity, unknownSubQuantity.value]); // add new known to givenArr
					
					if (unknownSubQuantity == searched) { // if the calculated Quantity is searched
						return searched.value; // return searched value
					}
				}
			}
		}
	}
}


// console.log('solution: ' + getSolution([[m, 2], [g, 3], [s, - 4]], mgs));


let givenArr = [[m, 2], [g, 3], [F_el, 4], [l, 5]];
let searched = W_el;

assignValues(givenArr);

// console.log(givenArr);

function run(given, searched) {
	let prev = [], curr = [null];
	if (prev.length == curr.length) { return 'why are you gay?'; }
	prev = given;
	let val = getSolution(given, searched);
	if (val) { return val; }
  curr = given;
}

console.log('solution: ' + run(givenArr, searched));