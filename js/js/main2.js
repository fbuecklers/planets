var con;
var range = 6000;
var range2 = range / 2;
var planets = [];
var matrix = Matrix.IDENTITY;
var coords;
var coordsArray = [];
var center = [0, 0, 0];
var zoom = 1;
var cx, cy;
var canvas;
var box;

var imageData;
var current;
var timer;

window.onload = function() {
	box = document.getElementById('box');
	canvas = document.getElementById('planets');
	
	con = canvas.getContext('2d');
	
	console.log('start');
	createMap();
	drawMap(0, 0, center, zoom);
	endMoveMap();
	
	cx = canvas.offsetLeft;
	cy = canvas.offsetTop;
	
	canvas.addEventListener('mousedown', beginMoveMap, false);
	run();
};

var lastX, lastY;
function beginMoveMap(e) {
	lastX = e.clientX;
	lastY = e.clientY;
	
	document.addEventListener('mousemove', moveMap, false);
	document.addEventListener('mouseup', endMoveMap, false);
}

function moveMap(e) {
	var offsetX = (e.clientX - lastX);
	var offsetY = e.clientY - lastY;
	
	lastX = e.clientX;
	lastY = e.clientY;

	drawMap(offsetX * Math.PI / 180, offsetY * Math.PI / 180, center, zoom);
}

function endMoveMap() {
//	coords = new RasterMap();
//	for (var i = 0, el; el = coordsArray[i]; ++i)
//		coords.put(el.pv[0] + 400, -el.pv[2] + 400, el.pv[1], el);
//	
//	imageData = con.getImageData(0, 0, 800, 800);

	document.removeEventListener('mousemove', moveMap, false);
	document.removeEventListener('mouseup', endMoveMap, false);
}

var counter = 0;
function run() {
	for (var i = 0, p; p = ps[i]; ++i) {
		p.pos = p.pos.rotateN(p.n, p.w).normalize(p.r);
	}
	
	drawMap(0, 0);
	
//	if (counter < 100)
		window.setTimeout(run, 20);
}

function createMap() {
	var hyp = range2 * range2;
	
	for (var i = 0; i < 1000; ) {
		var x = Math.floor(Math.random() * range) - range2;
		var y = Math.floor(Math.random() * range) - range2; 
		var z = Math.floor(Math.random() * range) - range2;
		
		if (x * x + y * y + z * z < hyp) {
			++i;
			
			planets.push([x, y, z]);
		}		
	}
}

/**
 * @param {Vector} v
 * @param {Number} r
 * @param {Number} w
 * @param {String} img
 * @returns {Planet}
 */
function Planet(v, r, w, img) {
	this.n = v.normalize();
	this.r = r;
	this.w = w;
	this.pos = v.cross(Vector.Z).normalize(r);
	
	this.img = new Image();
	
	this.img.src = img;
}

Planet.prototype.draw = function(positiveY) {
	this.drawLine(positiveY);
	this.drawPlanet(positiveY);
}

Planet.prototype.drawLine = function(positiveY) {
	var n = matrix.dot(this.n);
	
	var rotate = Math.atan2(n.x, n.z);
	var scale = Math.acos(n.y);
	
	con.save();
	con.rotate(-rotate);
	con.scale(1, -Math.cos(scale));

	con.beginPath();
	con.lineWidth = 1.4;
	con.strokeStyle = 'rgb(255,255,255)';
	
	if (positiveY)
		con.arc(0, 0, this.r, 0, Math.PI, false);
	else
		con.arc(0, 0, this.r, Math.PI, Math.PI * 2, false);
	
	con.setTransform(1, 0, 0, 1, 0, 0);
	
	con.stroke();
	con.closePath();
	
	con.restore();
}

Planet.prototype.drawPlanet = function(positiveY) {
	var pos = matrix.dot(this.pos);
	if (pos.y > 0 && positiveY || pos.y <= 0 && !positiveY) {
		var size = 20 - pos.y / 400 * 10;
		con.drawImage(this.img, pos.x - size / 2, pos.z - size / 2, size, size);
	}
}

var ps = [
  new Planet(new Vector(2, 3, 0), 100, -Math.PI / 90, 'img/planet.png'),
  new Planet(new Vector(0, 1, 3), 200, Math.PI / 180, 'img/planet.png'),
  new Planet(new Vector(1, 0, 0), 250, Math.PI / 270, 'img/planet.png'),
  new Planet(new Vector(1, 4, 2), 300, Math.PI / 360, 'img/jupiter.png')
];

var sun = new Image();
sun.src = 'img/sonne.png';

function drawMap(alpha, beta, cent, zoom) {
	if (alpha != 0) {
		matrix = matrix.rotateZ(alpha);
	}
	
	if (beta != 0) {
		matrix = matrix.rotateX(beta);
	}
	
	con.clearRect(0, 0, 800, 800);
	
	con.save();
	con.translate(400, 400);
	con.scale(1, 1);
	
//	var x = mProdukt3x1to2D(matrix, [80, 0, 0]);
//	
//	con.strokeStyle = 'rgb(255,0,0)';
//	con.beginPath();
//	con.moveTo(0, 0);
//	con.lineTo(x[0], x[2]);
//	con.stroke();
//	
//	var y = mProdukt3x1to2D(matrix, [0, 80, 0]);
//
//	con.strokeStyle = 'rgb(0,255,0)';
//	con.beginPath();
//	con.moveTo(0, 0);
//	con.lineTo(y[0], y[2]);
//	con.stroke();
//	
//	var z = mProdukt3x1to2D(matrix, [0, 0, 80]);
//
//	con.strokeStyle = 'rgb(0,0,255)';
//	con.beginPath();
//	con.moveTo(0, 0);
//	con.lineTo(z[0], z[2]);
//	con.stroke();
//	con.scale(.2, .2)
	for (var i = ps.length - 1, p; p = ps[i]; --i) {
		p.draw(true);
	}
	
	var size = 60;
	con.drawImage(sun, - size / 2, - size / 2, size, size);
	
	for (var i = 0, p; p = ps[i]; ++i) {
		p.draw(false);
	}
	
	con.restore();
	
}
