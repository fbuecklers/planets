

CanvasRenderingContext2D.prototype.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
}

CanvasRenderingContext2D.prototype.clear = function() {
	this.save();
	this.resetTransform();
	this.clearRect(0, 0, 800, 800);
	this.restore();
}

CanvasRenderingContext2D.prototype.dot = function(x, y, radius) {
	this.beginPath();
	this.arc(x, y, radius, 0, Math.PI * 2, false);
	this.fill();
}

function createMap(map) {
	var radius = 3000;
	var hyp = radius * radius;
	
	var stars = [];
	for (var i = 0; i < 1000; ) {
		var position = new Vector(
			Math.floor(Math.random() * radius * 2) - radius,
			Math.floor(Math.random() * radius * 2) - radius, 
			Math.floor(Math.random() * radius * 2) - radius
		);
		
		if (position.dot(position) < hyp) {
			++i;
			var name = 'P4X' + pad(position.x) + pad(position.y) + pad(position.z);
			var normal = new Vector(Math.random() * 10, Math.random() * 10, Math.random() * 10);
			var star = new Star(position, normal, name);
			map.addComponent(new MapStar(star));
			
			var planetsCount = 2 + Math.ceil(Math.random() * 10);
			for (var j = 0; j < planetsCount; ++j) {
				var n = normal.add(new Vector(Math.random() * 5, (Math.random() - .5) * 3, (Math.random() - .5) * 3)).normalize();
				var r = (j + 1) - .4 + Math.random() * .8;
				var p = n.cross(normal).normalize(r);
				var planet = new Planet(star, n, p, r, 100 + Math.random() * 500, 'img/planet.png');
				
				star.planets.push(planet);
			}
			
		}		
	}
	
	function pad(num) {
		var s = Math.floor(num / 100);
		s += '';
		
		while (s.length < 2)
			s = '0' + s;
		
		return s;
	};
	
	return stars;
}



var map;
window.onload = function() {
	var canvas = document.getElementById('planets');
	
	map = new Map(canvas);
	var stars = createMap(map);
	
	var route = new Route(null, new Vector(1500, 0, 0), new Vector(0, 0, 0));
	route.add(new Vector(0, 1500, 0));
	route.add(new Vector(0, 200, 400));
	route.add(new Vector(-500, -300, 1000));
	route.add(new Vector(400, 400, 800));

	map.addComponent(new MapRoute(route));
	map.addComponent(new MapCoordinate());
	console.log('start');
	
	map.update();
	map.draw();
};

var Map = MapComponent.inherit({
	initialize: function(element) {
		this.superCall();
		
		this.size = 3000;
		this.element = element;
		this.context = element.getContext('2d');
		this.radius = this.size;
		this.center = Vector.ZERO;
		this.zoom = 1;
		this.raster = null;
		
		this.eventDispatcher = new EventDispatcher(this);
		
		this.context.translate(400, 400);
		this.matrix = new Matrix(
			[400 / this.radius, 0, 0], 
			[0, -400 / this.radius, 0], 
			[0, 0, 400 / this.radius]
		);
		this.inverseMatrix = null;
	},
	
	getComponent: function(x,y){
		return this.raster.get(x, y);
	},
	
	reset: function() {
		this.context.clear();
		this.matrix = null;
		this.inverseMatrix = null;
	},
	
	wheel : function(e) {
		var delta = e.mouseDelta;
		var oldZoom = this.zoom;
		
		this.zoom += this.zoom * delta / 20;
		if (this.zoom < .5)
			this.zoom = .5;
		
		if (this.zoom > 3000)
			this.zoom = 3000;
		
		this.matrix = this.matrix.scale(this.zoom / oldZoom);
		this.inverseMatrix = null;
		this.radius = this.size / this.zoom;
		
		if (e.target instanceof MapStar && this.center !== e.target.star.position) {
			if (oldZoom < this.zoom) {
				var cp = e.target.star.position.sub(this.center);
				var step = cp.normalize(this.size / (oldZoom - this.zoom));
				
				if (step.abs() > cp.abs()) {
					this.center = e.target.star.position;
				} else {			
					this.center = this.center.add(step);
				}
			} 
		}
		
		if (this.zoom < 1) {
			this.center = Vector.ZERO;
		} else if (this.center.abs() + this.radius > this.size) {
			this.center = this.center.normalize((1 - 1/this.zoom) * this.size);
		}
		
		for (var i = 0, c; c = this.components[i]; ++i)
			c.zoom();
		
		this.draw();
	},
	
	endWheel: function() {
		this.update();
	},
	
	over: function() {
		this.draw();
	},
	
	last: null,
	rotate: false,
	beginMove: function(e) {
		this.last = e.mouse;
		this.rotate = e.mouse.abs() > 300;
	},
	
	move: function(e) {
		if (this.rotate) {
			var x = new Vector(1, 0);
			var currentAngle = e.mouse.angle(x);
			if (e.mouse.y < 0)
				currentAngle = Math.PI * 2 - currentAngle;
			
			var lastAngle = this.last.angle(x);
			if (this.last.y < 0)
				lastAngle = Math.PI * 2 - lastAngle;
			
			var diff = lastAngle - currentAngle;
			if (diff)
				this.matrix = this.matrix.rotateZ(-diff);
		} else {			
			var diff = e.mouse.sub(this.last);
			
			if (diff.x)
				this.matrix = this.matrix.rotateY(diff.x * Math.PI / 180);
			
			if (diff.y)
				this.matrix = this.matrix.rotateX(-diff.y * Math.PI / 180);
		}
		this.inverseMatrix = null;
		
		for (var i = 0, c; c = this.components[i]; ++i)
			c.rotate();
		
		this.draw();
		this.last = e.mouse;
	},
	
	endMove: function(e) {
		this.update();
	},
	
	transform: function(v) {
		return this.matrix.dot(v.sub(this.center));
	},
	
	transformAll: function(points) {
		var tpoints = [];
		for (var i = 0, point; point = points[i]; ++i)
			tpoints[i] = this.transform(point);
		
		return tpoints;
	},
	
	inverseTransform: function(v) {
		if (!this.inverseMatrix){
			this.inverseMatrix = this.matrix.inverse();
		}
		return this.inverseMatrix.dot(v).add(this.center);
	},
	
	update: function() {
		this.superCall();
		
		this.raster = new RasterMap();
		for (var i = 0, c; c = this.components[i]; ++i) {
			if (c.visible) {
				this.raster.put(c);
			}
		}
	},
	
	draw: function() {
		this.context.clear();
		
		for (var i = 0, c; c = this.components[i]; ++i) {
			if (c.visible) {
				c.draw();
			}
		}
	}
});




var counter = 0;
function run() {
	drawMap(Math.PI / 180, Math.PI / 90, this.center, this.zoom);
	
	counter++;
	
//	if (counter < 100)
		window.setTimeout(run, 0);
}





var RasterMap = Object.inherit({
	initialize: function() {
		this.array = new Array(6400);
	},
	
	get: function(x, y) {
		var bucket = this.getBucket(x, y);
		return bucket? bucket.component: null;
	},
	
	getBucket: function(x, y) {
		var index = this.getIndex(x, y);
		var buckets = this.array[index];
		
		var obj = null;
		if (buckets) {
			var minAbs = 101; 
			
			for (var i = 0, bucket; bucket = buckets[i]; ++i) {
				var abs = Math.pow(bucket.x - x, 2) + Math.pow(bucket.y - y, 2);
				
				if (abs < minAbs) {
					minAbs = abs;
					obj = bucket;
				}
			}
		}
		
		return obj;
	},

	put: function(component) {
		if (component.bounds) {
			this.putBound(component, component.bounds, 0);
		} 
		
		if (component.components) {
			for (var i = 0, c; c = component.components[i]; ++i) {
				this.put(c);
			}
		}
	},
	
	putBound: function(component, bound) {
		var x = bound.x, y = bound.y;
		
		var bucket = {
			x: x,
			y: y,
			depth: bound.z,
			component: component
		};
		
		var index = this.getIndex(x, y);
		
		var xOffset = x % 10 < 5? -1: 1;
		var yOffset = y % 10 < 5? -80: 80;
		
		this.indexPut(index, bucket);
		this.indexPut(index + xOffset, bucket);
		this.indexPut(index + yOffset, bucket);
		this.indexPut(index + xOffset + yOffset, bucket);
	},

	indexPut: function(index, obj) {
		var buckets = this.array[index];
		if (!buckets) {
			this.array[index] = [obj];
		} else {
			for (var i = 0, bucket; bucket = buckets[i]; ++i) {
				if (bucket.depth > obj.depth) {
					buckets.splice(i, 0, obj);
					return;
				}
			}
			
			buckets.push(obj);
		}		
	},

	getIndex: function(x, y) {
		return Math.floor((x + 400) / 10) + 80 * Math.floor((y + 400) / 10);
	}
});
