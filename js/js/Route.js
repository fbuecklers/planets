var Route = Object.inherit({
	initialize: function(ship, start, end) {
		this.ship = ship;
		this.points = [start, end];
		this.tangents = [];
		
		this.update(0);
	},
	
	set: function(index, vector) {
		this.points[i] = vector;
		
		this.update(index);
	},
	
	add: function(index, vector) {
		if (index instanceof Vector) {			
			vector = index;
			index = this.points.length;
		}
		
		this.points.splice(index, 0, vector);
		this.update(index);
	},
	
	remove: function(index) {
		this.points.splice(index, 1);
		this.update(index);
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
		
		return this.points[index].scalar(Math.pow(1 - t, 3))
			.add(this.tangents[index * 2].scalar(3 * t * Math.pow(1 - t, 2)))
			.add(this.tangents[index * 2 + 1].scalar(3 * Math.pow(t, 2) * (1 - t)))
			.add(this.points[index + 1].scalar(Math.pow(t, 3)));
	},
	
	update: function() {
		this.updateTangents();
		this.updateLength();
	},
	
	updateTangents: function(index) {
		var tk = 3;
//		var start = index <= 0? 0: index - 1;
//		var end = index >= this.length - 1? this.length - 1: index + 1;
		this.tangents = [];
		
		for (var i = 0; i < this.points.length; ++i) {
			var t1 = t2;
			var t2 = null;
			if (i == 0) {
				t2 = this.points[1].sub(this.points[0]);
			} else if (i == this.points.length - 1) {
				t2 = this.points[this.points.length - 1].sub(this.points[this.points.length - 2]);
			} else {
				t2 = this.points[i + 1].sub(this.points[i - 1]);
			}
			
			if (i > 0) {				
				var p1 = this.points[i - 1];
				var p2 = this.points[i];
				
				var abs = p2.sub(p1).abs();
				this.tangents.push(p1.add(t1.normalize(abs / tk)));
				this.tangents.push(p2.sub(t2.normalize(abs / tk)));
			}
		}
	},
	
	updateLength: function() {
		this.length = 0;
		this.lengths = [];
		
		var interval = 2;
		for (var i = 0; i < this.points.length - 1; i++) {
			var current = this.points[i];
			var parts = Math.ceil(this.points[i + 1].sub(current).abs() / interval);
			
			var len = 0;
			for (var j = 0; j < parts; ++j) {
				var next = this.getPoint(j / parts, i);
				len += next.sub(current).abs();
				current = next;
			}
			
			this.lengths.push(len);
			this.length += len;
		}
	}
});