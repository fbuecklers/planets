var Route = Object.inherit({
	initialize: function(start, end) {
		this.points = [start, end];
		this.tangents = [];
		
		this.update(0);
	},
	
	moveTo: function(index, vector) {
		this.points[i] = vector;
		
		this.update(index);
	},
	
	add: function(index, vector) {
		if (index instanceof Vector) {			
			vector = index;
			index = this.length;
		}
		
		this.points.splice(index, 0, vector);
		this.update(index);
	},
	
	remove: function(index) {
		this.points.splice(index, 1);
		this.update(index);
	},
	
	update: function(index) {
		this.length = this.points.length;
		
//		var start = index <= 0? 0: index - 1;
//		var end = index >= this.length - 1? this.length - 1: index + 1;
		
		for (var i = 0; i < this.length; ++i) {
			if (i === 0) {
				this.tangents[0] = this.points[1].sub(this.points[0]);
			} else if (i === this.length - 1) {
				this.tangents[i] = this.points[this.length - 1].sub(this.points[this.length - 2]);
			} else {
				this.tangents[i] = this.points[i + 1].sub(this.points[i - 1]);
			}
		}
	}
});