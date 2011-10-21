


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
			
			var planetsCount = 2 + Math.ceil(Math.random() * 10);
			for (var j = 0; j < planetsCount; ++j) {
				var n = normal.add(new Vector(Math.random() * 5, (Math.random() - .5) * 3, (Math.random() - .5) * 3)).normalize();
				var r = (j + 1) - .4 + Math.random() * .8;
				var p = n.cross(normal).normalize(r);
				var planet = new Planet(star, n, p, r, 100 + Math.random() * 500, 'img/planet.png');
				
				star.planets.push(planet);
			}
			
			map.addComponent(new MapStar(star));
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
	map.onResize();
};

var Map = CanvasComponent.inherit({
	
	initialize: function(element) {
		this.superCall();
		
		this.width = 800;
		this.height = 800;
		this.size = 3000;
		this.element = element;
		this.context = element.getContext('2d');
		this.radius = this.size;
		this.center = Vector.ZERO;
		this.zoomFactor = 1;
		this.raster = null;
		
		this.eventDispatcher = new EventDispatcher(this);
		
		this.context.setTransform(1, 0, 0, 1, 400, 400);
		this.matrix = new Matrix(
			[400 / this.radius, 0, 0], 
			[0, -400 / this.radius, 0], 
			[0, 0, 400 / this.radius]
		);
		this.inverseMatrix = null;
		
		window.addEventListener('resize', this.onResize, false);
	},
	
	getComponent: function(x,y){
		return this.raster.getComponent(x, y);
	},
	
	reset: function() {
		this.context.clear();
		this.matrix = null;
		this.inverseMatrix = null;
	},
	
	onResize: function(e) {
		var oldWidth = this.width;
		
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		
		this.element.width = this.width = window.innerWidth;
		this.element.height = this.height = window.innerHeight;
		
		this.context.setTransform(1, 0, 0, 1, this.width/2, this.height/2);
		this.matrix = this.matrix.scale(this.width / oldWidth);
		this.inverseMatrix = null;
		
		this.update();
		this.draw();
	},
	
	wheel : function(e) {
		var delta = e.mouseDelta;
		var oldZoom = this.zoomFactor;
		
		this.zoomFactor += this.zoomFactor * delta / 20;
		if (this.zoomFactor < .5)
			this.zoomFactor = .5;
		
		if (this.zoomFactor > 3000)
			this.zoomFactor = 3000;
		
		this.matrix = this.matrix.scale(this.zoomFactor / oldZoom);
		this.inverseMatrix = null;
		this.radius = this.size / this.zoomFactor;
		
		if (e.target instanceof MapStar && this.center != e.target.star.position) {
			if (oldZoom < this.zoomFactor) {
				var cp = e.target.star.position.sub(this.center);
				var step = cp.normalize(this.radius / 10);
				
				if (step.abs() > cp.abs()) {
					this.center = e.target.star.position;
				} else {			
					this.center = this.center.add(step);
				}
			} 
		}
		
		if (this.zoomFactor < 1) {
			this.center = Vector.ZERO;
		} else if (this.center.abs() + this.radius > this.size) {
			this.center = this.center.normalize((1 - 1/this.zoomFactor) * this.size);
		}
		
		this.zoom();
		
		this.draw();
	},
	
	endWheel: function() {
		this.update();
	},
	
	over: function() {
		this.draw();
	},
	
	last: null,
	rotateZ: false,
	beginMove: function(e) {
		this.last = e.mouse;
		this.rotateZ = e.mouse.abs() > this.width * 3/8;
	},
	
	move: function(e) {
		if (this.rotateZ) {
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
		
		this.rotate();
		
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
	
	time: null,
	zoom: function() {
		this.superCall();
		
		if (this.radius > 500) {
			if (this.animationTimer) {				
				window.clearInterval(this.animationTimer);
				this.animationTimer = undefined;
			}
		} else {
			if (!this.animationTimer) {				
				this.animationTimer = window.setInterval(this.onAnimationTimer, 100);
			}
		}
	},
	
	onAnimationTimer: function() {
		this.animate();
		this.draw();
	},
	
	update: function() {
		this.superCall();
		
		this.raster = new RasterMap(this.width, this.height);
		for (var i = 0, c; c = this.components[i]; ++i) {
			if (c.visible) {
				this.raster.putComponent(c);
			}
		}
	},
	
	draw: function() {
		this.context.clear();
		
		this.superCall();
	}
});




var counter = 0;
function run() {
	drawMap(Math.PI / 180, Math.PI / 90, this.center, this.zoomFactor);
	
	counter++;
	
//	if (counter < 100)
		window.setTimeout(run, 0);
}





var RasterMap = Object.inherit({
	initialize: function(width, height) {
		this.width = width;
		this.height = height;
		
		this.cols = Math.ceil(width / 50);
		this.rows = Math.ceil(height / 50);
		
		this.array = new Array(this.cols * this.rows);
	},
	
	getComponent: function(x, y) {
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

	putComponent: function(component) {
		if (component.bounds) {
			this.putBound(component, component.bounds, 0);
		} 
		
		if (component.components) {
			for (var i = 0, c; c = component.components[i]; ++i) {
				this.putComponent(c);
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
		
		var xOffset = x % 50 < 25? -1: 1;
		var yOffset = y % 50 < 25? -this.cols: this.cols;
		
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
		return Math.floor((x + this.width/2) / 50) + this.cols * Math.floor((y + this.height/2) / 50);
	}
});
