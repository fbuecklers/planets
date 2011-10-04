

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

function createMap() {
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
			var star = new Star(position, name);
			
			stars.push(star);
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
	var stars = createMap();
	for (var i = 0, s; s = stars[i]; ++i)
		map.addComponent(new MapStar(s));
	
	var route = new Route(null, new Vector(1500, 0, 0), new Vector(0, 0, 0));
	route.add(new Vector(0, 1500, 0));
	route.add(new Vector(0, 200, 400));
	route.add(new Vector(-500, -300, 1000));
	route.add(new Vector(400, 400, 800));

	map.addComponent(new MapRoute(route));
	map.addComponent(new MapCoordinate());
	console.log('start');
	
	map.draw();
	map.updateRaster();
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
		this.currentComponent = null;
		this.raster = null;
		
		this.context.translate(400, 400);
		this.matrix = new Matrix(
			[400 / this.radius, 0, 0], 
			[0, -400 / this.radius, 0], 
			[0, 0, 400 / this.radius]
		);
		
		element.addEventListener('mousedown', this.onBeginMove, false);
		element.addEventListener('mousemove', this.onOver, false);
		element.addEventListener('mousewheel', this.onWheel, false);
		element.addEventListener('DOMMouseScroll', this.onWheel, false);
	},
	
	reset: function() {
		this.context.clear();
		this.matrix = null;
	},
	
	onWheel: function(e) {
		var direction = e.wheelDelta? e.wheelDelta: -e.detail;
		var delta = direction > 0? 2: -2;
		var oldZoom = this.zoom;
//		
//		if (delta > 5)
//			delta = 5;
//		
		this.zoom -= delta / 50;
		if (this.zoom < 0.05)
			this.zoom = 0.05;
		
		if (this.zoom > 1.5)
			this.zoom = 1.5;
		
		this.matrix = this.matrix.scale(oldZoom / this.zoom);
		this.radius = this.size * this.zoom;
		
		if (this.currentComponent instanceof MapStar && this.center !== this.currentComponent.star.position) {
			if (oldZoom > this.zoom) {
				var cp = this.currentComponent.star.position.sub(this.center);
				var step = cp.normalize(this.size * (oldZoom - this.zoom));
				
				if (step.abs() > cp.abs()) {
					this.center = this.currentComponent.star.position;
				} else {			
					this.center = this.center.add(step);
				}
			} 
		}
		
		if (this.zoom >= 1) {
			this.center = Vector.ZERO;
		} else if (this.center.abs() + this.radius > this.size) {
			this.center = this.center.normalize((1 - this.zoom) * this.size);
		}
		
		for (var i = 0, c; c = this.components[i]; ++i)
			c.zoom();
		
		this.draw();
		
		this.element.removeEventListener('mousemove', this.onOver, false);
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(this.onWheelTimer, 1000);
		
		e.preventDefault();
	},
	
	onWheelTimer: function() {
		this.updateRaster();
		this.element.addEventListener('mousemove', this.onOver, false);
	},
	
	onOver: function(e) {
		var mousePosition = this.getEventMousePosition(e);
		this.currentComponent = this.raster.get(mousePosition.x, mousePosition.y);
		if (!this.currentComponent) {
			this.currentComponent = this;
		}
		
		this.draw();
		
		var evt = new MapEvent('over', mousePosition);
		this.currentComponent.dispatchEvent(evt);
	},
	
	onBeginMove: function(e) {
		document.addEventListener('mousemove', this.onMove, false);
		document.addEventListener('mouseup', this.onEndMove, false);
		this.element.removeEventListener('mousemove', this.onOver, false);
		
		var evt = new MapEvent('beginMove', this.getEventMousePosition(e));
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.beginMove(evt);
		}
	},
	
	onMove: function(e) {
		var evt = new MapEvent('move', this.getEventMousePosition(e));
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.move(evt);
		}
	},
	
	onEndMove: function(e) {
		document.removeEventListener('mousemove', this.onMove, false);
		document.removeEventListener('mouseup', this.onEndMove, false);
		this.element.addEventListener('mousemove', this.onOver, false);
		
		var evt = new MapEvent('endMove', this.getEventMousePosition(e));
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.endMove(evt);
		}
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
		
		for (var i = 0, c; c = this.components[i]; ++i)
			c.rotate();
		
		this.draw();
		this.last = e.mouse;
	},
	
	endMove: function(e) {
		this.updateRaster();
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
	
	getEventMousePosition: function(e) {
		var x = e.clientX - this.element.offsetLeft - 400;
		var y = e.clientY - this.element.offsetTop - 400; 
		return new Vector(x, y);
	},
	
	updateRaster: function() {
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

var MapEvent = Event.inherit({
	initialize: function(type, mouse) {
		this.initEvent(type, true, true);
		this.mouse = mouse;
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
		this.array = {};
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
