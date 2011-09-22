function Matrix(array, rows, columns) {
	this.array = array;
	this.length = array.length;
	this.columns = columns;
	this.rows = rows;
}

Matrix.IDENTITY = new Matrix([
    1, 0, 0, 
    0, 1, 0,
    0, 0, 1
], 3, 3);

/**
 * 
 * @param {Matrix} matrix
 * @returns
 */
Matrix.prototype.add = function(matrix) {
	if (this.rows != matrix.rows || this.columns != matrix.columns)
		return undefined;
	
	var newArray = new Array(this.length);
	
	for (var i = 0; i < this.length; ++i) {
		newArray[i] = this.array[i] + matrix.array[i];
	}
	
	return new this.constructor(newArray, this.rows, this.columns);
}

/**
 * 
 * @param {Matrix} matrix
 * @returns
 */
Matrix.prototype.sub = function(matrix) {
	if (this.rows != matrix.rows || this.columns != matrix.columns)
		return undefined;
	
	var newArray = new Array(this.length);
	
	for (var i = 0; i < this.length; ++i) {
		newArray[i] = this.array[i] - matrix.array[i];
	}
	
	return new this.constructor(newArray, this.rows, this.columns);
}

Matrix.prototype.scalar = function(dot) {
	var newArray = new Array(this.length);
	
	for (var i = 0; i < this.length; ++i) {
		newArray[i] = dot * this.array[i];
	}
	
	return new this.constructor(newArray, this.rows, this.columns);
}

/**
 * 
 * @param {Matrix} matrix
 * @returns
 */
Matrix.prototype.transform = function(matrix) {
	if (matrix.columns != this.rows)
		return undefined;
	
	var size = matrix.columns;
	var len = matrix.rows * this.columns;
	var newArray = new Array(len);

	for (var i = 0; i < matrix.rows; ++i) {
		for (var j = 0; j < this.columns; ++j){
			var index = i*this.columns + j;
			
			newArray[index] = 0;
			for (var k = 0; k < size; ++k) {
				newArray[index] += matrix.array[i*matrix.columns + k] * this.array[j + k*this.columns];
			}
		}
	}
	
	return new this.constructor(newArray, matrix.rows, this.columns);
}

Matrix.prototype.scale = function(scale) {
	return this.transform(new Matrix([
  	    scale, 0, 0,
  	    0, scale, 0,
  	    0, 0, scale
  	], 3, 3));
}

Matrix.prototype.rotateX = function(alpha) {
	return this.transform(new Matrix([
	    1, 0, 0,
	    0, Math.cos(alpha), -Math.sin(alpha),
	    0, Math.sin(alpha), Math.cos(alpha)
	], 3, 3));
}

Matrix.prototype.rotateZ = function(alpha) {
	return this.transform(new Matrix([
	    Math.cos(alpha), -Math.sin(alpha), 0,
	    Math.sin(alpha), Math.cos(alpha), 0,
	    0, 0, 1
	], 3, 3));
}

Matrix.prototype.rotateN = function(n, alpha) {
	var cos = Math.cos(alpha);
	var sin = Math.sin(alpha);
	var n1 = n.array[0], n2 = n.array[1], n3 = n.array[2];
	
	return this.transform(new Matrix([
	    cos + n1*n1*(1-cos), n1*n2*(1-cos) - n3*sin, n1*n3*(1-cos) + n2*sin,
	    n2*n1*(1-cos) + n3*sin, cos + n2*n2*(1-cos), n2*n3*(1-cos) - n1*sin,
	    n3*n1*(1-cos) - n2*sin, n3*n2*(1-cos) + n1*sin, cos + n3*n3*(1-cos)
	], 3, 3));
}

/**
 * @base Matrix
 * @param {Array} array
 */
function Vector(array) {
	array = array instanceof Array? array: Array.prototype.slice.call(arguments, 0);
	
	Matrix.call(this, array, array.length, 1);
	this.constructor = Vector;
}

Vector.prototype = Object.create(Matrix.prototype, {
	x : {
		get : function() {
			return this.array[0];
		},
		set : function(x) {
			this.array[0] = x;
		}
	},
	y : {
		get : function(y) {
			return this.array[1];
		},
		set : function(y) {
			this.array[1] = y;
		}
	},
	z : {
		get : function() {
			return this.array[2];
		},
		set : function(z) {
			this.array[2] = z;
		}
	}
});

Vector.ZERO = new Vector(0, 0, 0);
Vector.X = new Vector(1, 0, 0);
Vector.Y = new Vector(0, 1, 0);
Vector.Z = new Vector(0, 0, 1);

/**
 * @returns Number
 */
Vector.prototype.abs = function() {
	return Math.sqrt(this.dot(this));
}

/**
 * 
 * @returns Vector
 */
Vector.prototype.normalize = function(to) {
	return this.scalar((to? to: 1) / this.abs());
}

/**
 * 
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.prototype.cross = function(v) {
	if (this.length != v.length || this.length != 3)
		return undefined;
	
	return new Vector([
	    this.y * v.z - this.z * v.y, 
		this.z * v.x - this.x * v.z,
		this.x * v.y - this.y * v.x
	]);
}

/**
 * 
 * @param {Vector} v
 * @returns Number
 */
Vector.prototype.dot = function(v) {
	if (this.length != v.length)
		return undefined;
	
	var dot = 0;
	
	for (var i = 0; i < this.length; ++i) {
		dot += this.array[i] * v.array[i];
	} 
	
	return dot;
}

/**
 * 
 * @param {Vector} v
 * @returns Number
 */
Vector.prototype.angle = function(v) {
	return Math.acos(this.dot(v));
}