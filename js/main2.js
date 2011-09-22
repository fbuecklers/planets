/**
 * 
 */
function TestBase() {
	
}


function Test() {
	var number = 4;
	this.myVar = number;
}

Test.prototype = new TestBase();

Test.prototype.test = function(a, b) {
	return [a, b];
};

Test.prototype.malte = function(alter) {
	this.myVar;
	
	return alter;
};

var t = new Test();

