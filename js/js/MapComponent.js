var Component = EventTarget.inherit({
	
	initialize: function() {
		this.superCall();
		this.components = [];
	},
	
	init: function(parentComponent) {
		this.parentComponent = parentComponent;
	},
	
	addComponent: function(component) {
		this.components.push(component);
		component.init(this);
	},
	
	removeComponent: function(component) {
		var index = this.components.indexOf(component);
		if (index != -1) {			
			this.components.splice(index, 1);
		}
	},
	
	dispatchEventListeners: function(evt, useCapture) {
		if (useCapture) {
			if (this.parentComponent && this.parentComponent.dispatchEventListeners(evt, useCapture)) {
				return true;
			} else {
				return this.superCall(evt, useCapture);								
			}
		} else {
			if (this.superCall(evt, useCapture)) {
				return true;
			} else if (evt.bubbles && this.parentComponent) {
				return this.parentComponent.dispatchEventListeners(evt, useCapture);
			} else {
				return false;
			}
		}
	}
});

var MapComponent = Component.inherit({
	init: function(parentComponent) {
		this.superCall(parentComponent);
		
		var map = null;
		if (parentComponent instanceof Map) {
			map = parentComponent;
		} else {
			map = parentComponent.map;
		}
		
		if (map && map != this.map) {
			this.map = map;
			this.context = map.context;
			
			for (var i = 0, c; c = this.components[i]; ++i) {
				c.init(this);
			}
		}
	},
	
	update: function() {
		for (var i = 0, c; c = this.components[i]; ++i)
			c.update();
	},
	
	draw: function() {},
	rotate: function() {},
	zoom: function() {},
});

var MapStar = MapComponent.inherit({
	initialize: function(star) {
		this.superCall();
		this.star = star;
		this.active = false;
		
		this.addEventListener('over', this.over, false);
		this.addEventListener('out', this.out, false);
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
		var relStar = this.star.position.sub(this.map.center);
		
		this.visible = relStar.abs() < this.map.radius;
		if (this.visible) {
			this.bounds = this.map.matrix.dot(relStar);
		} else {
			this.bounds = null;
		}
	},
	
	rotate: function() {
		if (this.visible) {
			this.bounds = this.map.transform(this.star.position);
		}
	},
	
	draw: function() {
		if (this.map.radius > 500) {
			var dot = (.25 + (this.bounds.z + 400) / 800) * this.map.zoom;
			
			this.context.fillStyle = 'white';
			this.context.strokeStyle = 'white';
			this.context.font = '12px Verdana';
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

			var planets = this.star.planets;
			for (var i = planets.length - 1, p; p = planets[i]; --i) {
				this.drawPlanet(p, false);
			}
			
			var size = .5 * this.map.zoom;
			this.context.drawImage(this.star.image, - size / 2, - size / 2, size, size);
			
			for (var i = 0, p; p = planets[i]; ++i) {
				this.drawPlanet(p, true);
			}
			
			this.context.restore();
		}
	},
	
	drawPlanet: function(planet, positive) {
		var n = this.map.matrix.dot(planet.normal).normalize();
		var pos = this.map.matrix.dot(planet.position).normalize(planet.radius * this.map.zoom);

		var rotate = Math.atan2(n.x, n.y);
		var scale = Math.acos(n.z);
		
		this.context.save();
		this.context.rotate(-rotate);
		this.context.scale(1, -Math.cos(scale));

		this.context.beginPath();
		this.context.lineWidth = .8;
		this.context.strokeStyle = 'white';
		
		if (positive)
			this.context.arc(0, 0, planet.radius * this.map.zoom, 0, Math.PI, false);
		else
			this.context.arc(0, 0, planet.radius * this.map.zoom, Math.PI, Math.PI * 2, false);
		
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.stroke();
		this.context.restore();
		
		if (pos.z > 0 && !positive || pos.z <= 0 && positive) {
			var size = .2 * this.map.zoom;
			this.context.drawImage(planet.image, pos.x - size / 2, pos.y - size / 2, size, size);
		}
	}
});

var MapRoute = MapComponent.inherit({
	
	initialize: function(route) {
		this.superCall();
		this.route = route;
		
		for (var i = 0; i < route.points.length - 1; ++i) {
			this.addComponent(new MapRoutePoint(i, true));
			this.addComponent(new MapRoutePoint(i, false));
		}
		this.addComponent(new MapRoutePoint(i, true));
		
		this.addEventListener('over', this.over, false);
		this.addEventListener('beginMove', this.beginMove, false);
		this.addEventListener('move', this.move, false);
		this.addEventListener('endMove', this.endMove, false);
	},
	
	over: function() {
		var mousePosition = this.map.mousePosition;
		
		
	},
	
	beginMove: function(e) {
		e.preventDefault();
	},
	
	move: function(e) {
		if (e.target.point) {
			var p = this.points[e.target.index];
			var v = this.map.inverseTransform(new Vector(e.mouse.x, e.mouse.y, p.z));
			this.route.points[e.target.index] = v;
			this.route.updateTangents();
			
			this.update();
			this.map.draw();
		}
		
		
		e.preventDefault();
	},
	
	endMove: function(e) {
		if (e.target.point) {
			this.route.updateLength();
		}
		
		e.preventDefault();
	},
	
	draw: function() {
		this.context.save();
		this.context.beginPath();
		this.context.arc(0, 0, 400, 0, Math.PI * 2, false);
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
			var pos = this.map.transform(this.route.getPoint((i + 1) / 4));
			this.context.dot(pos.x, pos.y, 2);
		}
		
		this.context.restore();
	},
	
	update: function() {
		this.zoom();
	},
	
	rotate: function() {
		this.points =  this.map.transformAll(this.route.points);
		
		this.tangnts = this.map.transformAll(this.route.tangents);
		this.middlePoints = [];
		for (var i = 0; i < this.points.length - 1; ++i) {
			var middlePoint = this.map.transform(this.route.getPoint(.5, i));
			
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
		var rad = 400;
		
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

var MapRoutePoint = MapComponent.inherit({
	initialize: function(index, point) {
		this.superCall();
		
		this.index = index;
		this.point = point;
	}
});

var MapCoordinate = MapComponent.inherit({
	initialize: function() {
		this.superCall();
		
		this.center = new Vector(310, -310, 0);
		this.visible = true;
	},
	
	update: function() {
		this.rotate();
	},
	
	rotate: function() {
		this.x = this.map.matrix.dot(new Vector(this.map.radius / 10, 0, 0));
		this.y = this.map.matrix.dot(new Vector(0, this.map.radius / 10, 0));
		this.z = this.map.matrix.dot(new Vector(0, 0, this.map.radius / 10));
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