var Matrix = Object.inherit({
	/**
	 * @constructor
	 * @memberOf Matrix
	 * @param array
	 * @param rows
	 * @param columns
	 */
	initialize: function(array) {
		var arr = array[0] instanceof Array? array: Array.prototype.slice.call(arguments, 0);
		
		this.array = arr;
		this.rows = arr.length;
		this.columns = arr[0].length;
	},
	
	add: function(matrix) {
		if (this.rows != matrix.rows || this.columns != matrix.columns)
			return undefined;
		
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				newArray[i][j] = this.array[i][j] + matrix.array[i][j];
			}
		}
		
		return new this.constructor(newArray);
	},
	
	sub: function(matrix) {
		if (this.rows != matrix.rows || this.columns != matrix.columns)
			return undefined;
		
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				newArray[i][j] = this.array[i][j] - matrix.array[i][j];
			}
		}
		
		return new this.constructor(newArray);
	},
	
	scalar: function(dot) {
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				newArray[i][j] = this.array[i][j] * dot;
			}
		}
		
		return new this.constructor(newArray);
	},
	
	transform: function(matrix) {
		if (matrix.columns != this.rows)
			return undefined;
		
		var newArray = [];

		for (var i = 0; i < matrix.rows; ++i) {
			newArray[i] = [];
			for (var j = 0; j < this.columns; ++j){
				newArray[i][j] = 0;
				for (var k = 0; k < this.rows; ++k) {
					newArray[i][j] += matrix.array[i][k] * this.array[k][j];
				}
			}
		}
		
		return new this.constructor(newArray);
	},
	
	scale: function(scale) {
		return this.transform(new Matrix(
	  	    [scale, 0, 0],
	  	    [0, scale, 0],
	  	    [0, 0, scale]
	  	));
	},

	rotateX: function(alpha) {
		return this.transform(new Matrix(
		    [1, 0, 0],
		    [0, Math.cos(alpha), -Math.sin(alpha)],
		    [0, Math.sin(alpha), Math.cos(alpha)]
		));
	},

	rotateZ: function(alpha) {
		return this.transform(new Matrix(
		    [Math.cos(alpha), -Math.sin(alpha), 0],
		    [Math.sin(alpha), Math.cos(alpha), 0],
		    [0, 0, 1]
		));
	},

	rotateN: function(n, alpha) {
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		var n1 = n.array[0], n2 = n.array[1], n3 = n.array[2];
		
		return this.transform(new Matrix(
		    [cos + n1*n1*(1-cos), n1*n2*(1-cos) - n3*sin, n1*n3*(1-cos) + n2*sin],
		    [n2*n1*(1-cos) + n3*sin, cos + n2*n2*(1-cos), n2*n3*(1-cos) - n1*sin],
		    [n3*n1*(1-cos) - n2*sin, n3*n2*(1-cos) + n1*sin, cos + n3*n3*(1-cos)]
		));
	},
	
	toString: function() {
		return JSON.stringify(this.array);
	}
});

Matrix.IDENTITY = new Matrix(
    [1, 0, 0], 
    [0, 1, 0],
    [0, 0, 1]
);

var Vector = Matrix.inherit({
	x: {
		get : function() {
			return this.array[0][0];
		},
		set : function(x) {
			this.array[0][0] = x;
		}
	},
	
	y: {
		get : function(y) {
			return this.array[1][0];
		},
		set : function(y) {
			this.array[1][0] = y;
		}
	},
	
	z: {
		get : function() {
			return this.array[2][0];
		},
		set : function(z) {
			this.array[2][0] = z;
		}
	},
	
	/**
	 * @constructor
	 * @super Matrix
	 * @memberOf Vector
	 * @param array
	 */
	initialize: function(array) {
		var arr;
		if (array instanceof Array) {
			arr = array;
		} else {
			arr = [];
			for (var i = 0; i < arguments.length; ++i) {
				arr[i] = [arguments[i]];
			}
		}
		
		this.superCall(arr);
	},
	
	abs: function() {
		return Math.sqrt(this.dot(this));
	},

	/**
	 * 
	 * @returns Vector
	 */
	normalize: function(to) {
		return this.scalar((to !== undefined? to: 1) / this.abs());
	},

	/**
	 * 
	 * @param {Vector} v
	 * @returns {Vector}
	 */
	cross: function(v) {
		if (this.length != v.length || this.length != 3)
			return undefined;
		
		return new Vector(
		    this.y * v.z - this.z * v.y, 
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	},

	/**
	 * 
	 * @param {Vector} v
	 * @returns Number
	 */
	dot: function(v) {
		if (this.rows != v.rows)
			return undefined;
		
		var dot = 0;
		for (var i = 0; i < this.rows; ++i) {
			dot += this.array[i][0] * v.array[i][0];
		} 
		
		return dot;
	},

	/**
	 * 
	 * @param {Vector} v
	 * @returns Number
	 */
	angle: function(v) {
		return Math.acos(this.dot(v));
	}
});

Vector.ZERO = new Vector(0, 0, 0);
Vector.X = new Vector(1, 0, 0);
Vector.Y = new Vector(0, 1, 0);
Vector.Z = new Vector(0, 0, 1);

