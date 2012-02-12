

var CanvasComponent = ElementComponent.inherit({
	initialize: function(element) {
		this.superCall(element);
		
		if (element) {			
			this.context = element.getContext('2d');
			this.canvasComponent = this;
		}
	},
	
	init: function(parentComponent) {
		this.superCall(parentComponent);
		
		if (this.canvasComponent != this) {
			if (this.canvasComponent != parentComponent.canvasComponent) {				
				this.canvasComponent = parentComponent.canvasComponent;
				this.context = this.canvasComponent.context;
				this.element = this.canvasComponent.element;
				
				for (var i = 0, c; c = this.components[i]; ++i) {
					c.init(this);
				}
			}
		}
	},
	
	update: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			c.update();
	},
	
	draw: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			if (c.visible)
				c.draw();
	},
	
	rotate: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			if (c.visible)
				c.rotate();
	},
	
	zoom: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			c.zoom();
	},
	
	animate: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			if (c.visible)
				c.animate();
	}
});

var MapStar = CanvasComponent.inherit({
	initialize: function(star) {
		this.superCall();
		this.star = star;
		this.active = false;
		
		for (var i = 0, p; p = star.planets[i]; ++i)
			this.addComponent(new MapStarPlanet(p));
		
		this.addListener('over', this.over);
		this.addListener('out', this.out);
	},
	
	update: function() {
		this.zoom();
	},
	
	over: function(e) {
		var box = document.getElementById('box');
		box.innerHTML = 'Position: ' + this.bounds + '</br> v: ' + this.star.position;
		box.style.left = e.mouse.x + 'px';
		box.style.top = e.mouse.y + 'px';
		
		this.active = true;
	},
	
	out: function(e) {
		var box = document.getElementById('box');
		box.innerHTML = '';
		
		this.active = false;
	},
	
	zoom: function() {
		var relStar = this.star.position.sub(this.canvasComponent.center);
		
		this.visible = relStar.abs() < this.canvasComponent.radius;
		if (this.visible) {
			this.bounds = this.canvasComponent.matrix.dot(relStar);
		} else {
			this.bounds = null;
		}
	},
	
	rotate: function() {
		this.bounds = this.canvasComponent.transform(this.star.position);
	},
	
	draw: function() {
		if (this.canvasComponent.radius > 500) {
			var dot = (this.bounds.z / this.canvasComponent.width + .5) * this.canvasComponent.zoomFactor;
			
			this.context.strokeStyle = 'white';
			this.context.font = '12px Verdana';
			
//			if (this.canvasComponent.radius < 1500) {				
//				var gradient = this.context.createRadialGradient(this.bounds.x, this.bounds.y, dot, this.bounds.x, this.bounds.y, 0)
//				gradient.addColorStop(0, '#000000');
//				gradient.addColorStop(.4, '#770000');
//				gradient.addColorStop(.95, '#ffffff');
//				this.context.fillStyle = gradient;
//			} else {
				this.context.fillStyle = '#ffffff';
//			}
			
			this.context.dot(this.bounds.x, this.bounds.y, dot);		

			if (this.active) {
				this.context.beginPath();
				this.context.strokeStyle = 'red';
				this.context.arc(this.bounds.x, this.bounds.y, 10, 0, Math.PI * 2);
				this.context.stroke();
			}
		} else {
			this.context.save();
			this.context.translate(this.bounds.x, this.bounds.y);
			
			for (var i = this.components.length - 1, p; p = this.components[i]; --i) {
				p.draw(false);
			}
			
			var size = .5 * this.canvasComponent.zoomFactor;
			this.context.drawImage(this.star.image, - size / 2, - size / 2, size, size);
			
			for (var i = 0, p; p = this.components[i]; ++i) {
				p.draw(true);
			}
			
			this.context.restore();
		}
	}
});

var MapStarPlanet = CanvasComponent.inherit({
	initialize: function(planet) {
		this.superCall();
		
		this.visible = true;
		
		this.planet = planet;
		this.position = this.planet.position;
	},
	
	animate: function() {
		this.position = this.position.rotateN(this.planet.normal, 1/this.planet.days * 2 * Math.PI);
	},
	
	draw: function(positive) {
		var n = this.canvasComponent.matrix.dot(this.planet.normal).normalize();
		var pos = this.canvasComponent.matrix.dot(this.position).normalize(this.planet.radius * this.canvasComponent.zoomFactor);
	
		var rotate = Math.atan2(n.x, n.y);
		var scale = Math.acos(n.z);
		
		this.context.save();
		this.context.rotate(-rotate);
		this.context.scale(1, -Math.cos(scale));
	
		this.context.beginPath();
		this.context.lineWidth = .02 * this.canvasComponent.zoomFactor;
		this.context.strokeStyle = 'white';
		
		if (positive)
			this.context.arc(0, 0, this.planet.radius * this.canvasComponent.zoomFactor, 0, Math.PI, false);
		else
			this.context.arc(0, 0, this.planet.radius * this.canvasComponent.zoomFactor, Math.PI, Math.PI * 2, false);
		
		this.context.resetTransform();
		this.context.stroke();
		this.context.restore();
		
		if (pos.z > 0 && !positive || pos.z <= 0 && positive) {
			var size = .2 * this.canvasComponent.zoomFactor;
			this.context.drawImage(this.planet.image, pos.x - size / 2, pos.y - size / 2, size, size);
		}
	}
});

var MapRoute = CanvasComponent.inherit({
	
	initialize: function(route) {
		this.superCall();
		this.route = route;
		
		for (var i = 0; i < route.points.length - 1; ++i) {
			this.addComponent(new MapRoutePoint(i, true));
			this.addComponent(new MapRoutePoint(i, false));
		}
		this.addComponent(new MapRoutePoint(i, true));
		
		this.focusTimer = Timeout.create(1000, this.onFocus);
		this.focusIndex = null;
		this.focusComponent = null;
		
		this.addListener('move', this.onMove);
		this.addListener('endMove', this.onEndMove);
	},
	
	updateRoutePoint: function(index, v) {
		this.route.points[index] = v;
		this.route.updateTangents();
		
		this.update();		
		this.canvasComponent.draw();
	},
	
	onMove: function(e) {
		var v;
		if (e.target.point) {
			var p = this.points[e.target.index];
			
			v = e.mouse.sub(this.canvasComponent.middle);
			v = new Vector(v.x, v.y, p.z);
			v = this.canvasComponent.inverseTransform(v);	
			
			var cmp = this.canvasComponent.getComponent(e.mouse);
			console.log(cmp)
			if (cmp instanceof MapStar) {
				this.focusIndex = e.target.index;
				this.focusComponent = cmp;
				this.focusTimer.start();
			} else {
				this.focusTimer.stop();
			}			
		} else {
			var newPoint = e.target;
			var index = newPoint.index;
			
			v = this.route.getPoint(.5, index);
			
			this.setComponent(index * 2 + 1, new MapRoutePoint(index, false));
			
			newPoint.point = true;
			newPoint.index = ++index;

			this.setComponent(index * 2 + 1, new MapRoutePoint(index, false));
			
			for (var i = (index + 1) * 2, cmp; cmp = this.components[i]; ++i)
				cmp.index++;
			
			this.route.add(index, v);
		}
		
		this.updateRoutePoint(e.target.index, v);
		
		e.stopPropagation();
	},
	
	onFocus: function() {
		var cmp = this.focusComponent;
		var v = cmp.star.position;
		if (this.focusIndex > 0 || this.focusIndex < this.route.points.length - 1) {
			var s1 = this.route.points[this.focusIndex - 1];
			var s2 = this.route.points[this.focusIndex + 1];
			
			var s = s2.sub(s1).normalize();
			var v1 = v.sub(s1);
			var v2 = s.scalar(v1.dot(s));
			
			v = v.add(v2.sub(v1).normalize(2));
		}
		
		this.updateRoutePoint(this.focusIndex, v);
	},
	
	onEndMove: function(e) {
		if (e.target.point) {
			this.route.updateLength();
		}
		
		this.focusTimer.stop();
	},
	
	draw: function() {
		this.context.save();
		this.context.beginPath();
		this.context.arc(0, 0, this.canvasComponent.middle.x, 0, Math.PI * 2, false);
		this.context.clip();
		
		for (var i = 0; i < this.points.length - 1; ++i) {
			var p1 = this.points[i];
			var p2 = this.points[i + 1];
			var cp1 = this.tangnts[i * 2];
			var cp2 = this.tangnts[i * 2 + 1];
			
			if (this.visiblePoints[i] && this.visiblePoints[i + 1]) {				
				this.context.strokeStyle = 'white';
			} else {
				this.context.strokeStyle = '1px dotted white';
			}

			this.context.beginPath();
			this.context.moveTo(p1.x, p1.y);
			this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
			this.context.stroke();
		}
		
		this.context.fillStyle = 'yellow';
		for (var i = 0, p; p = this.points[i]; ++i) {
			this.context.dot(p.x, p.y, 2);
		}
		
		this.context.fillStyle = 'red';
		for (var i = 0, p; p = this.middlePoints[i]; ++i) {
			this.context.dot(p.x, p.y, 2);
		}
		
		this.context.fillStyle = 'blue';
		for (var i = 0; i < 4; i++) {
			var pos = this.canvasComponent.transform(this.route.getPoint((i + 1) / 4));
			this.context.dot(pos.x, pos.y, 2);
		}
		
		this.context.restore();
	},
	
	update: function() {
		this.zoom();
	},
	
	rotate: function() {
		this.points =  this.canvasComponent.transformAll(this.route.points);
		this.tangnts = this.canvasComponent.transformAll(this.route.tangents);
		
		this.middlePoints = [];
		for (var i = 0; i < this.points.length - 1; ++i) {
			var middlePoint = this.canvasComponent.transform(this.route.getPoint(.5, i));
			
			this.middlePoints.push(middlePoint);
			this.components[i * 2].bounds = this.points[i];
			this.components[i * 2 + 1].bounds = middlePoint;
		}
		this.components[i * 2].bounds = this.points[i];
	},
	
	zoom: function() {
		this.visible = false;
		this.visiblePoints = [];
		
		this.rotate();
		
		for (var i = 0; i < this.points.length - 1; ++i) {
			var start = this.points[i];
			var target = this.points[i + 1];
			var visible = this.isLineVisible(start, target);
			
			this.visible |= visible;
			this.visiblePoints[i] |= visible;
			this.visiblePoints[i + 1] |= visible;
		}
	},
	
	isLineVisible: function(start, target) {
		var rad = this.canvasComponent.middle.x;
		
		if (start.abs() < rad && target.abs() < rad){
			return true;
		} else {
			var directionVector = target.sub(start);
			var p = directionVector.dot(start) / directionVector.dot(directionVector);
			var q = (start.dot(start) - rad * rad)/directionVector.dot(directionVector);
			var sqrt = Math.sqrt(p * p - q);
			
			if (sqrt !== Number.NaN) {
				var out = -p + sqrt; 
				var into = -p - sqrt;
			
				if (start.abs() > rad && 0 < into && into < 1){
			  		return true;
				}
				
				if (target.abs() > rad && 0 < out && out < 1){
					return true;
				}
			}
		}
		
		return false;
	}
});

var MapRoutePoint = CanvasComponent.inherit({
	initialize: function(index, point) {
		this.superCall();
		
		this.index = index;
		this.point = point;
	}
});

var MapCoordinate = CanvasComponent.inherit({
	initialize: function() {
		this.superCall();
		
		this.visible = true;
	},
	
	update: function() {
		var wDiff = this.canvasComponent.width * 1/10;
		
		this.center = new Vector(this.canvasComponent.middle.x - wDiff, -this.canvasComponent.middle.y + wDiff, 0);
		this.rotate();
	},
	
	rotate: function() {
		this.x = this.canvasComponent.matrix.dot(new Vector(this.canvasComponent.radius / 10, 0, 0));
		this.y = this.canvasComponent.matrix.dot(new Vector(0, this.canvasComponent.radius / 10, 0));
		this.z = this.canvasComponent.matrix.dot(new Vector(0, 0, this.canvasComponent.radius / 10));
	},
	
	draw: function() {
		this.drawLine(this.x, 'rgb(255,0,0)', 'x');
		this.drawLine(this.y, 'rgb(0,255,0)', 'y');
		this.drawLine(this.z, 'rgb(0,0,255)', 'z');
	},
	
	drawLine: function(line, color, label) {
		var linePoint = line.add(this.center);
		this.context.strokeStyle = color;
		this.context.beginPath();
		this.context.moveTo(this.center.x, this.center.y);
		this.context.lineTo(linePoint.x, linePoint.y);
		this.context.stroke();
		
		var textPoint = line.scale(1.3).add(this.center);
		this.context.font = 'Verdana';
		this.context.textAlign = 'center';
		this.context.baseLine = 'middle';
		this.context.fillStyle = 'white';
		this.context.fillText(label, textPoint.x, textPoint.y);
	}
});