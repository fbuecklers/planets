

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
	
	map = new Map(canvas, createMap());
	
	console.log('start');
	
	map.draw();
	map.updateRaster();
};

var Map = Object.inherit({
	initialize: function(element, stars) {		
		this.element = element;
		this.context = element.getContext('2d');
		this.stars = stars;
		this.radius = 3000;
		this.center = Vector.ZERO;
		this.zoom = 1;
		this.data = null;
		this.current = null;
		this.raster = null;
		
		this.cx = element.offsetLeft;
		this.cy = element.offsetTop;
		
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
		this.data = null;
		this.matrix = null;
	},

	save: function() {
		this.context.save();
		this.data = this.context.getImageData(0, 0, this.element.width, this.element.height);
		this.context.restore();
	},

	restore: function() {
		if (this.data) {
			this.context.save();
			this.context.clear();
			this.context.putImageData(this.data, 0, 0);
			this.context.restore();
		}
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
		
		if (this.current && this.center !== this.current.star.position) {
			if (oldZoom > this.zoom) {
				var cp = this.current.star.position.sub(this.center);
				var step = cp.normalize(this.radius * (oldZoom - this.zoom));
				
				if (step.abs() > cp.abs()) {
					this.center = this.current.star.position;
				} else {			
					this.center = this.center.add(step);
				}
			} 
		}
		
		if (this.zoom >= 1) {
			this.center = Vector.ZERO;
		} else if (this.center.abs() + this.radius * this.zoom > this.radius) {
			this.center = this.center.normalize((1 - this.zoom) * this.radius);
		}
		
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
		var x = e.clientX - this.cx;
		var y = (e.clientY - this.cy);
		
		this.restore();
		
		this.current = this.raster.get(x, y);
		if (this.current) {
			var box = document.getElementById('box');
			box.innerHTML = 'Position: ' + this.current.pv + '</br> v: ' + this.current.star.position;
			box.style.left = e.clientX + 'px';
			box.style.top = e.clientY + 'px';
			
			this.context.save();
			
			this.context.beginPath();
			this.context.strokeStyle = 'red';
			this.context.arc(this.current.pv.x, this.current.pv.y, 10, 0, Math.PI * 2);
			this.context.stroke();
			
			this.context.restore();
		}
	},
	
	last: null,
	rotate: false,
	
	onBeginMove: function(e) {
		this.last = new Vector(e.clientX - 400, -e.clientY + 400);
		this.rotate = this.last.abs() > 300;
		
		document.addEventListener('mousemove', this.onMove, false);
		document.addEventListener('mouseup', this.onEndMove, false);
		this.element.removeEventListener('mousemove', this.onOver, false);
	},
	
	onMove: function(e) {
		var current = new Vector(e.clientX - 400, -e.clientY + 400);
		
		if (this.rotate) {
			var x = new Vector(1, 0);
			var currentAngle = current.angle(x);
			if (current.y < 0)
				currentAngle = Math.PI * 2 - currentAngle;
			
			var lastAngle = this.last.angle(x);
			if (this.last.y < 0)
				lastAngle = Math.PI * 2 - lastAngle;
			
			this.rotateZ(lastAngle - currentAngle);
		} else {			
			var diff = current.sub(this.last);
			
			this.rotateY(diff.x * Math.PI / 180);
			this.rotateX(diff.y * Math.PI / 180);
		}
		
		this.last = current;
		this.draw();
	},
	
	onEndMove: function() {
		document.removeEventListener('mousemove', this.onMove, false);
		document.removeEventListener('mouseup', this.onEndMove, false);
		this.element.addEventListener('mousemove', this.onOver, false);
		
		this.updateRaster();
	},
	
	rotateX: function(alpha) {
		if (alpha) {
			this.matrix = this.matrix.rotateX(alpha);
		}
	},

	rotateY: function(alpha) {
		if (alpha) {
			this.matrix = this.matrix.rotateY(alpha);
		}
	},
	
	rotateZ: function(alpha) {
		if (alpha) {
			this.matrix = this.matrix.rotateZ(alpha);
		}
	},
	
	transform: function(v) {
		return this.matrix.dot(v.sub(this.center));
	},
	
	updateRaster: function() {
		this.raster = new RasterMap();
		
		var zoom = this.zoom * this.radius;
		for (var i = 0, star; star = this.stars[i]; ++i) {
			var relStar = star.position.sub(this.center);
			
			if (relStar.abs() < zoom) {
				var pv = this.matrix.dot(relStar);
				
				this.raster.put(pv.x + 400, pv.y + 400, pv.z, {
					pv : pv,
					star: star
				});
			}
		}
	},
	
	draw: function() {
		this.context.clear();
		
		this.context.fillStyle = 'white';
		this.context.strokeStyle = 'white';
		this.context.font = '12px Verdana';
		
		var zoom = this.zoom * this.radius;
		for (var i = 0, star; star = this.stars[i]; ++i) {
			var relStar = star.position.sub(this.center);
			
			if (relStar.abs() < zoom) {
				var pv = this.matrix.dot(relStar);
				this.drawStar(star, pv);
			}
		}
		
		this.drawWay();
		
//		this.context.scale(800 / this.radius * 2, 800 / this.radius * 2);
		
		var x = this.matrix.dot(new Vector(800, 0, 0));
		
		this.context.strokeStyle = 'rgb(255,0,0)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(x.x, x.y);
		this.context.stroke();
		
		var y = this.matrix.dot(new Vector(0, 800, 0));

		this.context.strokeStyle = 'rgb(0,255,0)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(y.x, y.y);
		this.context.stroke();
		
		var z = this.matrix.dot(new Vector(0, 0, 800));

		this.context.strokeStyle = 'rgb(0,0,255)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(z.x, z.y);
		this.context.stroke();
		
		this.save();
	},
	
	drawStar: function(star, pv) {
		var dot = (.25 + (pv.z + 400) / 800 * 2) / this.zoom;
//		if (pv.y < 0) {
//			this.context.strokeText(star.name, Math.floor(pv.x) + dot + 5, Math.floor(pv.z) - 5);
//		}
		
		this.context.dot(pv.x, pv.y, dot);
		
	},
	
	drawWay: function() {
		var points = [
		    new Vector(1500, 0, 0),
		    new Vector(0, 0, 0),
		    new Vector(0, 1500, 0),
		    new Vector(0, 200, 400),
		    new Vector(-500, -300, 1000),
		    new Vector(400, 400, 800)
		];
		
		var len = points.length;
		var tpoints = [];
		for (var i = 0; i < len; ++i)
			tpoints[i] = this.transform(points[i]);
		
		var tangents = [tpoints[1].sub(tpoints[0])];
		for (var i = 1; i < len - 1; ++i) {
			tangents[i] = tpoints[i + 1].sub(tpoints[i - 1]);
		}
		if (len > 2) 
			tangents[i] = tpoints[len - 1].sub(tpoints[len - 2]);
		
		this.context.strokeStyle = 'white';
		this.context.beginPath();
		this.context.moveTo(tpoints[0].x, tpoints[0].y);
		for (var i = 0; i < tpoints.length - 1; ++i) {
			var abs = tpoints[i + 1].sub(tpoints[i]).abs();
			var cp1 = tpoints[i].add(tangents[i].normalize(abs / 3));
			var cp2 = tpoints[i + 1].sub(tangents[i + 1].normalize(abs / 3));
			var p = tpoints[i + 1];
			this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
		}
		this.context.stroke();
		
		this.context.fillStyle = 'yellow';
		for (var i = 0, pv; pv = tpoints[i]; ++i) {
			this.context.dot(pv.x, pv.y, 2);
		}
		
		this.context.fillStyle = 'red';
		for (var i = 0; i < tpoints.length - 1; ++i) {
			var abs = tpoints[i + 1].sub(tpoints[i]).abs();
			var p0 = tpoints[i];
			var p1 = p0.add(tangents[i].normalize(abs / 3));
			var p3 = tpoints[i + 1];
			var p2 = p3.sub(tangents[i + 1].normalize(abs / 3));
			
			var t = .5;
			var pos = p0.scalar(Math.pow(1 - t, 3))
				.add(p1.scalar(3 * t * Math.pow(1 - t, 2)))
				.add(p2.scalar(3 * Math.pow(t, 2) * (1 - t)))
				.add(p3.scalar(Math.pow(t, 3)));
			
			this.context.dot(pos.x, pos.y, 2);
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





function RasterMap() {
	this.array = {};
}

RasterMap.prototype.get = function(x, y) {
	var index = this.getIndex(x, y);
	var box = this.array[index];
	
	var min = null;
	if (box) {
		var minAbs = 101; 
		
		for (var i = 0, el; el = box[i]; ++i) {
			var abs = Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2);
			
			if (abs < minAbs) {
				minAbs = abs;
				min = el.value;
			}
		}
	}
	
	return min;
};

RasterMap.prototype.put = function(x, y, depth, obj) {
	var index = this.getIndex(x, y);
	
	var xOffset = x % 10 < 5? -1: 1;
	var yOffset = y % 10 < 5? -80: 80;
	
	this.indexPut(index, x, y, depth, obj);
	this.indexPut(index + xOffset, x, y, depth, obj);
	this.indexPut(index + yOffset, x, y, depth, obj);
	this.indexPut(index + xOffset + yOffset, x, y, depth, obj);
};

RasterMap.prototype.indexPut = function(index, x, y, depth, obj) {
	var val = {
		x: x,
		y: y,
		depth: depth,
		value: obj
	};
	
	var arr = this.array[index];
	if (!arr) {
		this.array[index] = [val];
	} else {
		for (var i = 0, el; el = arr[i]; ++i) {
			if (el.depth > depth) {
				arr.splice(i, 0, val);
				return;
			}
		}
		
		arr.push(val);
	}		
};

RasterMap.prototype.getIndex = function(x, y) {
	return Math.floor(x / 10) + 80 * Math.floor(y / 10);
};

