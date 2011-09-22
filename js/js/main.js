var con;
var range = 6000;
var range2 = range / 2;
var stars = [];
var matrix = Matrix.IDENTITY;
var coords;
var coordsArray = [];
var center = Vector.ZERO;
var zoom = 1;
var cx, cy;
var canvas;
var box;

var imageData;
var current;
var timer;

CanvasRenderingContext2D.prototype.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
}

CanvasRenderingContext2D.prototype.clear = function() {
	this.save();
	this.resetTransform();
	this.clearRect(0, 0, this.width, this.height);
	this.restore();
}

window.onload = function() {
	box = document.getElementById('box');
	canvas = document.getElementById('planets');
	
	con = canvas.getContext('2d');
	
	console.log('start');
	createMap();
	drawMap(0, 0, center, zoom);
	endMoveMap();
//	timer();
	
	cx = canvas.offsetLeft;
	cy = canvas.offsetTop;
	
	canvas.addEventListener('mousedown', beginMoveMap, false);
	canvas.addEventListener('mousemove', overMap, false);
	canvas.addEventListener('mousewheel', wheelMap, false);
};

function Map(element, size) {
	this.element = element;
	this.context = element.getContext('2d');
	this.matrix = null;
	this.data = null;
}

Map.prototype.reset = function() {
	this.context.clear();
	this.data = null;
	this.matrix = null;
}

Map.prototype.save = function() {
	this.context.save();
	this.context.reset();
	this.data = this.context.getImageData(0, 0, element.width, element.height);
	this.context.restore();
}

Map.prototype.restore = function() {
	if (this.data) {
		this.context.save();
		this.context.reset();
		this.context.putImageData(this.data, 0, 0);
		this.context.restore();
	}
}

function wheelMap(e) {
	var delta = e.wheelDelta / 120;
	var oldZoom = zoom;
	
	if (delta > 5)
		delta = 5;
	
	zoom -= delta / 50;
	if (zoom < 0.05)
		zoom = 0.05;
	
	if (zoom > 1.5)
		zoom = 1.5;
	
	if (current && center != current.planet) {
		if (oldZoom > zoom) {
			var cp = current.planet.sub(center);
			var step = cp.normalize(range2 * (oldZoom - zoom));
			
			if (step.abs() > cp.abs()) {
				center = current.planet;
			} else {			
				center = center.add(step);
			}
		} 
	}
	
	if (zoom >= 1) {
		center = Vector.ZERO;
	} else if (center.abs() + range2 * zoom > range2) {
		center = center.normalize((1 - zoom) * range2);
	}
	
	drawMap(0, 0, center, zoom);
	endMoveMap();
	
	canvas.removeEventListener('mousemove', overMap, false);
	window.clearTimeout(timer);
	timer = window.setTimeout(function() {
		canvas.addEventListener('mousemove', overMap, false);
	}, 1000);
	
	e.preventDefault();
}

function overMap(e) {
	var x = e.clientX - cx;
	var y = (e.clientY - cy);
	
	current = coords.get(x, y);
	
	con.putImageData(imageData, 0, 0);
	if (current) {
		box.innerHTML = 'Pv: ' + current.pv.array + '</br> v: ' + current.planet;
		box.style.left = e.clientX + 'px';
		box.style.top = e.clientY + 'px';
		
		con.save();

		con.translate(400, 400);
		con.scale(1, -1);
		
		con.beginPath();
		con.strokeStyle = 'red';
		con.arc(current.pv.x, current.pv.z, 10, 0, Math.PI * 2);
		con.closePath();
		con.stroke();
		
		con.restore();
	}
}

var lastX, lastY;
function beginMoveMap(e) {
	lastX = e.clientX;
	lastY = e.clientY;
	
	document.addEventListener('mousemove', moveMap, false);
	document.addEventListener('mouseup', endMoveMap, false);
	canvas.removeEventListener('mousemove', overMap, false);
}

function moveMap(e) {
	var offsetX = (e.clientX - lastX);
	var offsetY = e.clientY - lastY;
	
	lastX = e.clientX;
	lastY = e.clientY;

	drawMap(offsetX * Math.PI / 180, offsetY * Math.PI / 180, center, zoom);
}

function endMoveMap() {
	coords = new RasterMap();
	for (var i = 0, el; el = coordsArray[i]; ++i)
		coords.put(el.pv.x + 400, -el.pv.z + 400, el.pv.y, el);
	
	imageData = con.getImageData(0, 0, 800, 800);

	document.removeEventListener('mousemove', moveMap, false);
	document.removeEventListener('mouseup', endMoveMap, false);
	canvas.addEventListener('mousemove', overMap, false);
}

var counter = 0;
function run() {
	drawMap(Math.PI / 180, Math.PI / 90, center, zoom);
	
	counter++;
	
//	if (counter < 100)
		window.setTimeout(run, 0);
}

function createMap() {
	var hyp = range2 * range2;
	
	for (var i = 0; i < 1000; ) {
		var star = new Vector(
			Math.floor(Math.random() * range) - range2,
			Math.floor(Math.random() * range) - range2, 
			Math.floor(Math.random() * range) - range2
		);
		
		if (star.dot(star) < hyp) {
			++i;
			
			stars.push(star);
		}		
	}
}

function drawMap(alpha, beta, cent, zoom) {
	if (alpha != 0) {
		matrix = matrix.rotateZ(alpha);
	}
	
	if (beta != 0) {
		matrix = matrix.rotateX(beta);
	}
	
	zoom *= range;

	var scale = 800 / zoom;

	con.save();
	con.clearRect(0, 0, 800, 800);
	
	con.translate(400, 400);
	con.scale(1, -1);
	
	con.fillStyle = 'rgb(255,255,255)';
	
	coordsArray = [];
	
	var m = matrix.scale(scale);
	
	for (var i = 0, star; star = stars[i]; ++i) {
		var relStar = star.sub(cent);
		
		if (relStar.abs() < zoom/2) {
			var pv = relStar.transform(m);
			
			coordsArray.push({
				pv : pv,
				planet: star
			});
			
			var dot = (.25 + (-pv.y + 400) / 800 * 2) / zoom * range;
			 
			con.beginPath();
			con.arc(pv.x, pv.z, dot, 0, Math.PI * 2, false);
			con.closePath();
			con.fill();
		}
	}
	
//	con.scale(800 / range, 800 / range);
	
	var x = new Vector(800, 0, 0).transform(matrix);
	
	con.strokeStyle = 'rgb(255,0,0)';
	con.beginPath();
	con.moveTo(0, 0);
	con.lineTo(x.x * 800 / range, x.z * 800 / range);
	con.stroke();
	
	var y = new Vector(0, 800, 0).transform(matrix);

	con.strokeStyle = 'rgb(0,255,0)';
	con.beginPath();
	con.moveTo(0, 0);
	con.lineTo(y.x * 800 / range, y.z * 800 / range);
	con.stroke();
	
	var z = new Vector(0, 0, 800).transform(matrix);

	con.strokeStyle = 'rgb(0,0,255)';
	con.beginPath();
	con.moveTo(0, 0);
	con.lineTo(z.x * 800 / range, z.z * 800 / range);
	con.stroke();
	
	con.restore();
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

