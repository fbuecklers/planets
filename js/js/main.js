var map;
window.onload = function() {
	surface = new StarSurface();
};

var StarSurface = DocumentComponent.inherit({
	
	initialize: function() {
		this.superCall();
		
		this.map = new StarMap(document.getElementById('planets'));
		this.createMap(this.map);
		
		var route = new Route(null, new Vector(1500, 0, 0), new Vector(0, 0, 0));
		route.add(new Vector(0, 1500, 0));
		route.add(new Vector(0, 200, 400));
		route.add(new Vector(-500, -300, 1000));
		route.add(new Vector(400, 400, 800));

		this.map.addComponent(new MapRoute(route));
		this.map.addComponent(new MapCoordinate());
		this.addListener('resize', this.onResize);
		
		console.log('start');
		
		this.map.resize(window.innerWidth, window.innerHeight);
	},
	
	createMap: function(map) {
		var radius = 3000;
		var hyp = radius * radius;
		
		for (var i = 0; i < 1000; ) {
			var position = new Vector(
				Math.floor(Math.random() * radius * 2) - radius,
				Math.floor(Math.random() * radius * 2) - radius, 
				Math.floor(Math.random() * radius * 2) - radius
			);
			
			if (position.dot(position) < hyp) {
				++i;
				var name = 'P4X' + this.pad(position.x) + this.pad(position.y) + this.pad(position.z);
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
	},
		
	pad: function(num) {
		var s = Math.floor(num / 100);
		s += '';
		
		while (s.length < 2)
			s = '0' + s;
		
		return s;
	},
	
	onResize: function(e) {
		this.map.resize(e.width, e.height);
	}
});

var StarMap = CanvasComponent.inherit({
	
	initialize: function(element) {
		this.superCall(element);
		
		this.width = 800;
		this.height = 800;
		this.middle = new Vector(400, 400);
		this.size = 3000;
		this.radius = this.size;
		this.center = Vector.ZERO;
		this.zoomFactor = 1;
		this.raster = null;
		
		this.context.setTransform(1, 0, 0, 1, 400, 400);
		this.matrix = new Matrix(
			[400 / this.radius, 0, 0], 
			[0, -400 / this.radius, 0], 
			[0, 0, 400 / this.radius]
		);
		this.inverseMatrix = null;
		
		this.animation = Interval.create(20, this.onAnimate);
		
		this.addListener('wheel', this.onWheel);
		this.addListener('endWheel', this.onEndWheel);
		this.addListener('beginMove', this.onBeginMove);
		this.addListener('move', this.onMove);
		this.addListener('endMove', this.onEndMove);
		this.addListener('over', this.onOver);
	},
	
	getComponent: function(mouse){
		return this.raster.getComponent(mouse.sub(this.middle));
	},
	
	reset: function() {
		this.context.clear();
		this.matrix = null;
		this.inverseMatrix = null;
	},
	
	resize: function(width, height) {
		var oldWidth = this.width;
		this.element.width = this.width = width;
		this.element.height = this.height = height;
		
		this.middle = new Vector(width/2, height/2);
		
		this.context.setTransform(1, 0, 0, 1, this.middle.x, this.middle.y);
		this.matrix = this.matrix.scale(this.width / oldWidth);
		this.inverseMatrix = null;
		
		this.update();
		this.draw();
	},
	
	onWheel : function(e) {
		this.zoom(e.mouseDelta / 20, e.target.star);
	},
	
	onEndWheel: function() {
		this.update();
	},
	
	rotateZ: false,
	onBeginMove: function(e) {
		this.rotateZ = e.mouse.sub(this.middle).abs() > this.width * 3/8;
	},
	
	onMove: function(e) {
		if (this.rotateZ) {
			var x = new Vector(1, 0);
			var currentAngle = e.mouse.sub(this.middle).angle(x);
			if (e.mouse.y < 0)
				currentAngle = Math.PI * 2 - currentAngle;
			
			var lastAngle = e.mousePrevious.sub(this.middle).angle(x);
			if (e.mousePrevious.y < 0)
				lastAngle = Math.PI * 2 - lastAngle;
			
			var diff = lastAngle - currentAngle;
			if (diff)
				this.rotate(Vector.Z, -diff);
		} else {
			if (e.mouseDelta.x)
				this.rotate(Vector.Y, e.mouseDelta.x * Math.PI / 180);
			
			if (e.mouseDelta.y)
				this.rotate(Vector.X, -e.mouseDelta.y * Math.PI / 180);
		}
		
	},
	
	onEndMove: function(e) {
		this.update();
	},
	
	onOver: function(e) {
		this.draw();
	},
	
	rotate: function(axis, angle) {
		if (angle) {
			if (axis == Vector.X) {				
				this.matrix = this.matrix.rotateX(angle);
			} else if (axis == Vector.Y) {
				this.matrix = this.matrix.rotateY(angle);
			} else if (axis == Vector.Z) {
				this.matrix = this.matrix.rotateZ(angle);
			}

			this.inverseMatrix = null;
			this.superCall();
			
			this.draw();
		}
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
	
	zoom: function(zoom, target, absolute) {
		var oldZoom = this.zoomFactor;
		
		if (absolute)
			this.zoomFactor = zoom;
		else
			this.zoomFactor += this.zoomFactor * zoom;
		
		if (this.zoomFactor < .5)
			this.zoomFactor = .5;
		
		if (this.zoomFactor > 3000)
			this.zoomFactor = 3000;
		
		this.matrix = this.matrix.scale(this.zoomFactor / oldZoom);
		this.inverseMatrix = null;
		this.radius = this.size / this.zoomFactor;
		
		if (target && target.position && this.center != target.position) {
			if (oldZoom < this.zoomFactor) {
				var cp = target.position.sub(this.center);
				var step = cp.normalize(this.radius / 10);
				
				if (step.abs() > cp.abs()) {
					this.center = target.position;
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
		
		this.superCall();
		
		if (this.radius > 500) {
			this.animation.stop();
		} else {
			this.animation.start();
		}
		
		this.draw();
	},
	
	onAnimate: function() {
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

var RasterMap = Object.inherit({
	initialize: function(width, height) {
		this.width = width;
		this.height = height;
		
		this.cols = Math.ceil(width / 50);
		this.rows = Math.ceil(height / 50);
		
		this.array = new Array(this.cols * this.rows);
	},
	
	getComponent: function(v) {
		var bucket = this.getBucket(v.x, v.y);
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
