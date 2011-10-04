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
			throw new Error('matrix can\'t be added to this, since the rows or columns aren\'t equal');
		
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			var arr = newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				arr[j] = this.array[i][j] + matrix.array[i][j];
			}
		}
		
		return new this.constructor(newArray);
	},
	
	sub: function(matrix) {
		if (this.rows != matrix.rows || this.columns != matrix.columns)
			throw new Error('matrix can\'t be substracted from this, since the rows or columns aren\'t equal');
		
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			var arr = newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				arr[j] = this.array[i][j] - matrix.array[i][j];
			}
		}
		
		return new this.constructor(newArray);
	},
	
	scalar: function(dot) {
		var newArray = [];
		for (var i = 0; i < this.rows; ++i) {
			var arr = newArray[i] = [];
			for (var j = 0; j < this.columns; ++j) {
				arr[j] = this.array[i][j] * dot;
			}
		}
		
		return new this.constructor(newArray);
	},
	
	dot: function(matrix) {
		if (this.columns != matrix.rows)
			throw new Error('This columns size is not equals to matrix rows size');
		
		var newArray = [];

		for (var i = 0; i < this.rows; ++i) {
			var arr = newArray[i] = [];
			for (var j = 0; j < matrix.columns; ++j){
				arr[j] = 0;
				for (var k = 0; k < this.columns; ++k) {
					arr[j] += this.array[i][k] * matrix.array[k][j];
				}
			}
		}
		
		return new matrix.constructor(newArray);
	},
	
	transpose: function() {
		var newArray = [];
		for (var i = 0; i < this.columns; ++i) {
			var arr = newArray[i] = [];
			for (var j = 0; j < this.rows; ++j) {
				arr[j] = this.array[j][i];
			}
		}
		return new Matrix(newArray);
	},
	
	det: function() {
		if (this.rows != 3 || this.columns != 3)
			throw new Error('Determinant is only implemented for 3x3 matrices');
		
		var sum = 0;
		for (var i = 0; i < 3; ++i) {
			var pro = 1; 
			for (var j = 0; j < 3; ++j)
				
				pro *= this.array[i+j][(i + j) % 3];
			sum += pro;
		}
		
		for (var i = 0; i < 3; ++i) {
			var pro = 1; 
			for (var j = 2; j > -1; --j)
				pro *= this.array[i][(j + 3 - i) % 3];
			sum -= pro;
		}
		
		return sum;
	},
	
	inverse: function() { 
		var adj = new Matrix (
		  [[this.array[1][1]*this.array[2][2]-this.array[1][2]*this.array[2][1],
            this.array[0][2]*this.array[2][1]-this.array[0][1]*this.array[2][2],
            this.array[0][1]*this.array[1][2]-this.array[0][2]*this.array[1][1]],
           [this.array[1][2]*this.array[2][0]-this.array[1][0]*this.array[2][2],
	        this.array[0][0]*this.array[2][2]-this.array[0][2]*this.array[2][0],
	        this.array[0][2]*this.array[1][0]-this.array[0][0]*this.array[1][2]],
	       [this.array[1][0]*this.array[2][1]-this.array[1][1]*this.array[2][0],
	        this.array[0][1]*this.array[2][0]-this.array[0][0]*this.array[2][1],
		    this.array[0][0]*this.array[1][1]-this.array[0][1]*this.array[1][0]]]);
		return new Matrix (adj.scalar(this.det));
	},

	
	scale: function(scale) {
		return new Matrix(
	  	    [scale, 0, 0],
	  	    [0, scale, 0],
	  	    [0, 0, scale]
	  	).dot(this);
	},

	rotateX: function(alpha) {
		return new Matrix(
		    [1, 0, 0],
		    [0, Math.cos(alpha), -Math.sin(alpha)],
		    [0, Math.sin(alpha), Math.cos(alpha)]
		).dot(this);
	},
	
	rotateY: function(alpha) {
		return new Matrix(
			[Math.cos(alpha), 0, Math.sin(alpha)],
			[0, 1, 0],
			[-Math.sin(alpha), 0, Math.cos(alpha)]
		).dot(this);
	},

	rotateZ: function(alpha) {
		return new Matrix(
		    [Math.cos(alpha), -Math.sin(alpha), 0],
		    [Math.sin(alpha), Math.cos(alpha), 0],
		    [0, 0, 1]
		).dot(this);
	},

	rotateN: function(n, alpha) {
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		var n1 = n.array[0], n2 = n.array[1], n3 = n.array[2];
		
		return new Matrix(
		    [cos + n1*n1*(1-cos), n1*n2*(1-cos) - n3*sin, n1*n3*(1-cos) + n2*sin],
		    [n2*n1*(1-cos) + n3*sin, cos + n2*n2*(1-cos), n2*n3*(1-cos) - n1*sin],
		    [n3*n1*(1-cos) - n2*sin, n3*n2*(1-cos) + n1*sin, cos + n3*n3*(1-cos)]
		).dot(this);
	},
	
	toString: function() {
		return 'Matrix: ' + JSON.stringify(this.array);
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
		}
	},
	
	y: {
		get : function(y) {
			return this.array[1][0];
		}
	},
	
	z: {
		get : function() {
			return this.array[2][0];
		}
	},
	
	/**
	 * @constructor
	 * @super Matrix
	 * @memberOf Vector
	 * @param array
	 */
	initialize: function(array) {
		var arr = array instanceof Array? array: arguments;
		
		if (arr.length == 1 && arr[0] instanceof Array)
			arr = arr[0];
		
		if (arr.length > 1 && !(arr[0] instanceof Array)) {
			m = [];
			for (var i = 0; i < arr.length; ++i) {
				m[i] = [arr[i]];
			}
		} else {
			m = arr;
		}
		
		this.superCall(m);
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
		if (this.rows != v.rows || this.rows != 3)
			return undefined;
		
		return new Vector(
		    this.y * v.z - this.z * v.y, 
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	},

	/**
	 * 
	 * @param {Vector | Matrix} v
	 * @returns Number | Vector
	 */
	dot: function(v) {
		if (v instanceof Vector) {
			var dot = 0;
			for (var i = 0; i < this.rows; ++i) {
				dot += this.array[i][0] * v.array[i][0];
			} 
			
			return dot;
		} else {
			return this.superCall(v);
		}
	},

	/**
	 * 
	 * @param {Vector} v
	 * @returns Number
	 */
	angle: function(v) {
		return Math.acos(this.dot(v) / (this.abs() * v.abs()));
	},
	
	toString: function() {
		var str = '';
		for (var i = 0; i < this.rows; ++i) {
			if (i > 0)
				str += ', ';
			
			str += this.array[i][0];
		}
		
		return 'Vector: [' + str + ']'; 
	}
});

Vector.ZERO = new Vector(0, 0, 0);
Vector.X = new Vector(1, 0, 0);
Vector.Y = new Vector(0, 1, 0);
Vector.Z = new Vector(0, 0, 1);

