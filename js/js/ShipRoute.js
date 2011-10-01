var ShipRoute = Object.inherit({
	initialize: function(ship, route) {
		this.ship = {
			
		};
		this.route = route;
		
		this.update();
	},
	
	update: function() {
		this.updateParamaters();
		this.updateLength();
	},
	
	updateLength: function() {
		this.length = 0;
		this.lengths = [];
		
		var interval = 2;
		for (var i = 0; i < this.route.length - 1; i++) {
			var current = this.route.points[i];
			var parts = Math.ceil(this.route.points[i + 1].sub(current).abs() / interval);
			
			var len = 0;
			for (var j = 0; j < parts; ++j) {
				var next = this.getPoint(j / parts, i);
				len += next.sub(current).abs();
				current = next;
			}
			
			this.lengths.push(len);
			this.length += len;
		}
	},

	updateParamaters: function() {
		this.paramaters = [];
		var tk = 3;
		for (var i = 0; i < this.route.length - 1; ++i) {
			var p1 = this.route.points[i];
			var p2 = this.route.points[i + 1];
			var abs = p2.sub(p1).abs();
			this.paramaters.push(p1);
			this.paramaters.push(p1.add(this.route.tangents[i].normalize(abs / tk)));
			this.paramaters.push(p2.sub(this.route.tangents[i + 1].normalize(abs / tk)));
		}
		this.paramaters.push(this.route.points[i]);
	},
	
	createGradient: function(start, target, gradient) {
		var rad = 400;
		if (start.abs() < rad && target.abs() < rad){
			gradient.addColorStop(0, 'white');
		} else {
			var directionVector = target.sub(start);
			var p = directionVector.dot(start) / directionVector.dot(directionVector);
			var q = (start.dot(start) - rad * rad)/directionVector.dot(directionVector);
			var sqrt = Math.sqrt(p * p - q);
			if (sqrt !== Number.NaN){
				var out = -p + sqrt; 
				var into = -p - sqrt;
				
				if (start.abs() > rad && target.abs() > rad){
					gradient.addColorStop( 0, 'transparent');
					gradient.addColorStop( into, 'transparent');
				  	gradient.addColorStop( into, 'white');
				  	gradient.addColorStop( out, 'white')
				  	gradient.addColorStop( out, 'transparent');
				} else if (start.abs() > rad){
			  		gradient.addColorStop( 0, 'transparent');
			  		gradient.addColorStop( into, 'transparent');
			  		gradient.addColorStop( into, 'white');
				} else {
					gradient.addColorStop( 0, 'white');
					gradient.addColorStop( out, 'white');
					gradient.addColorStop( out, 'transparent');
				}
			} else {
				gradient.addColorStop(0, 'transparent');
			}
		
		}
	},
	
	getPoint: function(t, index) {
		if (index === undefined) {
			var currentPosition, nextPosition = 0;
			index = -1;
			do {
				index++;
				currentPosition = nextPosition;
				nextPosition += this.lengths[index] / this.length;
			} while (index < this.lengths.length - 1 && t > nextPosition);
			
			t = (t - currentPosition) / (nextPosition - currentPosition);
		}
		
		index *= 3;
		
		return this.paramaters[index].scalar(Math.pow(1 - t, 3))
			.add(this.paramaters[index + 1].scalar(3 * t * Math.pow(1 - t, 2)))
			.add(this.paramaters[index + 2].scalar(3 * Math.pow(t, 2) * (1 - t)))
			.add(this.paramaters[index + 3].scalar(Math.pow(t, 3)));
	}
});