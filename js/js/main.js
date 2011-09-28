
var map;

CanvasRenderingContext2D.prototype.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
}

CanvasRenderingContext2D.prototype.clear = function() {
	this.save();
	this.resetTransform();
	this.clearRect(0, 0, this.width, this.height);
	this.restore();
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

window.onload = function() {
	canvas = document.getElementById('planets');
	
	map = new Map(canvas, createMap());
	
	console.log('start');
	
	map.draw();
};

var Map = Object.inherit({
	initialize: function(element, stars) {		
		this.element = element;
		this.context = canvas.getContext('2d');
		this.stars = stars;
		this.matrix = Matrix.IDENTITY;
		this.center = Vector.ZERO;
		this.zoom = 1;
		this.data = null;
		this.radius = 3000;
		this.current = null;
		this.raster = null;
		
		this.cx = element.offsetLeft;
		this.cy = element.offsetTop;
		
		this.beginMoveListener = this.onBeginMove.bind(this);
		this.moveListener = this.onMove.bind(this);
		this.endMoveListener = this.onEndMove.bind(this);
		this.overListener = this.onOver.bind(this);
		this.wheelListener = this.onWheel.bind(this);
		this.wheelTimerListener = this.onWheelTimer.bind(this);
		
		element.addEventListener('mousedown', this.beginMoveListener, false);
		element.addEventListener('mousemove', this.overListener, false);
		element.addEventListener('mousewheel', this.wheelListener, false);
		element.addEventListener('DOMMouseScroll', this.wheelListener, false);
	},
	
	reset: function() {
		this.context.clear();
		this.data = null;
		this.matrix = null;
	},

	save: function() {
		this.context.save();
		this.context.clear();
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
		
		if (delta > 5)
			delta = 5;
		
		this.zoom -= delta / 50;
		if (this.zoom < 0.05)
			this.zoom = 0.05;
		
		if (this.zoom > 1.5)
			this.zoom = 1.5;
		
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
		
		this.element.removeEventListener('mousemove', this.overListener, false);
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(this.wheelTimerListener, 1000);
		
		e.preventDefault();
	},
	
	onWheelTimer: function() {
		this.element.addEventListener('mousemove', this.overListener, false);
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
			
			this.context.translate(400, 400);
			this.context.scale(1, -1);
			
			this.context.beginPath();
			this.context.strokeStyle = 'red';
			this.context.arc(this.current.pv.x, this.current.pv.z, 10, 0, Math.PI * 2);
			this.context.closePath();
			this.context.stroke();
			
			this.context.restore();
		}
	},
	
	lastX: 0,
	lastY: 0,
	
	onBeginMove: function(e) {
		this.lastX = e.clientX;
		this.lastY = e.clientY;
		
		document.addEventListener('mousemove', this.moveListener, false);
		document.addEventListener('mouseup', this.endMoveListener, false);
		canvas.removeEventListener('mousemove', this.overListener, false);
	},
	
	onMove: function(e) {
		var offsetX = (e.clientX - this.lastX);
		var offsetY = e.clientY - this.lastY;
		
		this.lastX = e.clientX;
		this.lastY = e.clientY;
		
		this.rotateAlpha(offsetX * Math.PI / 180);
		this.rotateBeta(offsetY * Math.PI / 180);
		this.draw();
	},
	
	onEndMove: function() {
		document.removeEventListener('mousemove', this.moveListener, false);
		document.removeEventListener('mouseup', this.endMoveListener, false);
		this.element.addEventListener('mousemove', this.overListener, false);
	},
	
	rotateAlpha: function(alpha) {
		if (alpha != 0) {
			this.matrix = this.matrix.rotateZ(alpha);
		}
	},
	
	rotateBeta: function(beta) {
		if (beta != 0) {
			this.matrix = this.matrix.rotateX(beta);
		}
	},
	
	draw: function() {
		this.raster = new RasterMap();

		this.context.save();
		this.context.clearRect(0, 0, 800, 800);
		
		this.context.translate(400, 400);
		this.context.scale(1, -1);
		
		this.context.fillStyle = 'white';
		this.context.strokeStyle = 'white';
		this.context.font = '12px Verdana';
		
		var zoom = this.zoom * this.radius;
		var m = this.matrix.scale(400 / zoom);
		for (var i = 0, star; star = this.stars[i]; ++i) {
			var relStar = star.position.sub(this.center);
			
			if (relStar.abs() < zoom) {
				var pv = relStar.transform(m);
				this.raster.put(pv.x + 400, -pv.z + 400, pv.y, {
					pv : pv,
					star: star
				});
				
				this.drawStar(star, pv);
			}
		}
		
//		this.context.scale(800 / this.radius * 2, 800 / this.radius * 2);
		
		var x = new Vector(800, 0, 0).transform(this.matrix);
		
		this.context.strokeStyle = 'rgb(255,0,0)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(x.x * 400 / this.radius, x.z * 400 / this.radius);
		this.context.stroke();
		
		var y = new Vector(0, 800, 0).transform(this.matrix);

		this.context.strokeStyle = 'rgb(0,255,0)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(y.x * 400 / this.radius, y.z * 400 / this.radius);
		this.context.stroke();
		
		var z = new Vector(0, 0, 800).transform(this.matrix);

		this.context.strokeStyle = 'rgb(0,0,255)';
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(z.x * 400 / this.radius, z.z * 400 / this.radius);
		this.context.stroke();
		
		this.context.restore();
		
		this.save();
	},
	
	drawStar: function(star, pv) {
		var dot = (.25 + (-pv.y + 400) / 800 * 2) / this.zoom;
		
//		if (pv.y < 0) {
//			this.context.strokeText(star.name, Math.floor(pv.x) + dot + 5, Math.floor(pv.z) - 5);
//		}
		
		this.context.beginPath();
		this.context.arc(pv.x, pv.z, dot, 0, Math.PI * 2, false);
		this.context.closePath();
		this.context.fill();
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

