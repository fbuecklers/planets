CanvasRenderingContext2D.prototype.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
};

CanvasRenderingContext2D.prototype.clear = function() {
	this.save();
	this.resetTransform();
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.restore();
};

CanvasRenderingContext2D.prototype.dot = function(x, y, radius) {
	this.beginPath();
	this.arc(x, y, radius, 0, Math.PI * 2, false);
	this.fill();
};
