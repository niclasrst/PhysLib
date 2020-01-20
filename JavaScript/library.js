const math = require('mathjs');

let treePath = [];

class Quantity {
	constructor (name, unit, value, formula, parents) {
		this.name = name;
		this.unit = unit;
		this.value = value;
		this.formula = formula;
		this.parents = parents;
	};

	canCalculate = () => {
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
	allSubQuantitiesKnown = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) {
				return false;
			}
			return true;
		}
	}
	onlyThisSubQuantityUnknown = (subQuantity) => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i] != subQuantity && this.subQuantities[i] == undefined) {
				return false;
			}
		}
		return true;
	}
	calculate = (unknownQuantity) => {

		this.parentQuantity = eval(this.parentQuantity);

		if (unknownQuantity == this.parentQuantity) {
			let calc = 1;
			for (var i in this.subQuantities) {
				calc *= this.subQuantities[i].value;
			}
			return calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != null) {
					calc /= this.subQuantities[i].value;
				}
			}

			return calc;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der MulFormula vorhanden.')
		}
	}
	setParentValue = (parentValue) => {
		eval(this.parentQuantity).value = parentValue;
	}
}

class AddFormula {
	constructor (parentQuantity, subQuantities) {
		this.parentQuantity = parentQuantity;
		this.subQuantities = subQuantities;
	}
	getOperator = () => { return 'add'; }
	allSubQuantitiesKnown = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) {
				return false;
			}
			return true;
		}
	}
	onlyThisSubQuantityUnknown = (subQuantity) => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i] != subQuantity && this.subQuantities[i] == undefined) {
				return false;
			}
		}
		return true;
	}
	calculate = (unknownQuantity) => {
		if (unknownQuantity == this.parentQuantity) {
			let calc = 0;
			for (var i in this.subQuantities) {
				calc += this.subQuantities[i].value;
			}
			return calc;
		} else if (this.subQuantities.includes(unknownQuantity)) {
			let calc = this.parentQuantity.value;
			for (var i in this.subQuantities) {
				if (this.subQuantities[i].value != null) {
					calc -= this.subQuantities[i].value;
				}
			}
			return calc;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der AddFormula vorhanden.')
		}
	}
	setParentValue = (parentValue) => {
		this.parentQuantity.value = parentValue;
	}
}

class DivFormula {
	constructor (parentQuantity, dividendQuantity, divisorQuantity) {
		this.parentQuantity = parentQuantity;
		this.dividendQuantity = dividendQuantity;
		this.divisorQuantity = divisorQuantity;
	}
	getOperator = () => { return 'div'; }
	allSubQuantitiesKnown = () => {
		for (var i in this.subQuantities) {
			if (this.subQuantities[i].value === null) {
				return false;
			}
			return true;
		}
	}
	onlyThisSubQuantityUnknown = (subQuantity) => {
		if (this.dividendQuantity == subQuantity && this.divisorQuantity != undefined ||
			this.divisorQuantity == subQuantity && this.dividendQuantity != undefined) {
			return false;
		}
		return true;
	}
	calculate = (unknownQuantity) => {
		if (unknownQuantity == this.parentQuantity) {
			return eval(this.dividendQuantity).value / eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.dividendQuantity) {
			return eval(this.parentQuantity).value * eval(this.divisorQuantity).value;
		} else if (unknownQuantity == this.divisorQuantity) {
			return eval(this.parentQuantity).value / eval(this.dividendQuantity).value;
		} else {
			throw new Error('Die angegebene Größe ' + unknownQuantity.name + ' ist nicht in der DivFormula vorhanden.')
		}
	}
	setParentValue = (parentValue) => {
		this.parentQuantity.value = parentValue;
	}
}

let W_el, F_el, E_el, l, q, mgs, m, g, s;

m = new Quantity (
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
	
	
function assignValues(given) {
	for (var i in given) {
		given[i][0].value = given[i][1];
	}
}


function calcByPath() {
	
	let calc;
	
	for (i = treePath.length - 1; i > 1; i--) {
		
		calc = treePath[i].calculate(eval(treePath[i - 1].parentQuantity));
		treePath[i - 1].setParentValue(calc);
	}
	
	return treePath[1].calculate(treePath[0]);
}

function goTreeUp(searched) {

	if (searched.parents != []) { // hat die Größe Parents? falls nein -> unberechenbar
		
		for (var i in searched.parents) { // durch die Parents iterieren

			if (searched.parents[i].getConnectingFormula().onlyThisSubQuantityUnknown(searched)) { // wenn in der Parentformel nur die gesuchte Größe undefiniert ist

				console.log(searched.name + ": true");
				
				treePath.push(searched.parents[i].getConnectingFormula()); // die Parentformel zu treePath hinzufügen
				
				if (eval(searched.parents[i].quantity).value != null) { // wenn der Wert des Parents definiert ist

					return calcByPath(); // den gesuchten Wert nach dem treePath berechnen und returnen
				} else {
					
					return goTreeUp(eval(searched.parents[i].quantity));
				}
			} else { // wenn in der Parentformel noch andere undefinierte Größen vorhanden sind

				let subQuantities = searched.parents[i].formula.subquantites;
				
				for (var j in subQuantities) {

					if (subQuantities[j] == null)

					return goTreeDown(subQuantities[j]);
				}
			}
		}
		
	} else { return 'calculation impossible'; } // -> unberechenbar
}

function goTreeDown(searched) {


}

function getSolution(given, searched) {
	
	assignValues(given);
	
	treePath.push(searched);
	
	for (var i in searched.formula) {
		
		if (searched.formula[i].allSubQuantitiesKnown()) {
			return searched.formula[i].calculate(searched);
		}git
	}
	
	return goTreeUp(searched);
}


// console.log('solution: ' + getSolution([[m, 2], [g, 3], [s, - 4]], mgs));

console.log('solution: ' + getSolution([[m, 2], [g, 3], [s, 4], [F_el, 5]], l));