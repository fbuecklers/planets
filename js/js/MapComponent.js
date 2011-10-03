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
		
		if (parentComponent instanceof Map) {
			this.map = map;
		} else {
			this.map = parentComponent.map;
		}
	},
	
	draw: function() {},
	rotate: function() {},
	zoom: function() {},
});

var MapStar = MapComponent.inherit({
	initialize: function(star) {
		this.superCall();
		this.star = star;
		
		this.addEventListener('over', this.over, false);
	},
	
	init: function(parentComponent) {
		this.superCall(parentComponent);
		this.zoom();
	},
	
	over: function(e) {
		var box = document.getElementById('box');
		box.innerHTML = 'Position: ' + this.bounds + '</br> v: ' + this.star.position;
		box.style.left = e.mouse.x + 'px';
		box.style.top = e.mouse.y + 'px';
		
		this.map.context.beginPath();
		this.map.context.strokeStyle = 'red';
		this.map.context.arc(this.bounds.x, this.bounds.y, 10, 0, Math.PI * 2);
		this.map.context.stroke();
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
		this.map.context.fillStyle = 'white';
		this.map.context.strokeStyle = 'white';
		this.map.context.font = '12px Verdana';
		
		var dot = (.25 + (this.bounds.z + 400) / 800 * 2) / this.map.zoom;
		this.map.context.dot(this.bounds.x, this.bounds.y, dot);
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
	
	init: function(parentComponent) {
		this.superCall(parentComponent);
		this.zoom();
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
			this.points[e.target.index] = new Vector(e.mouse.x, e.mouse.y, p.z);
		}
		
		this.map.draw();
		
		e.preventDefault();
	},
	
	endMove: function(e) {
		e.preventDefault();
	},
	
	draw: function() {
		for (var i = 0; i < this.points.length - 1; ++i) {
			var p1 = this.points[i];
			var p2 = this.points[i + 1];
			var cp1 = this.tangnts[i * 2];
			var cp2 = this.tangnts[i * 2 + 1];
			
			this.map.context.beginPath();
			this.map.context.moveTo(p1.x, p1.y);
			this.map.context.strokeStyle = this.gradients[i];
			this.map.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
			this.map.context.stroke();
		}
		
		this.map.context.fillStyle = 'yellow';
		for (var i = 0, p; p = this.points[i]; ++i) {
			this.map.context.dot(p.x, p.y, 2);
		}
		
		this.map.context.fillStyle = 'red';
		for (var i = 0, p; p = this.middlePoints[i]; ++i) {
			this.map.context.dot(p.x, p.y, 2);
		}
		
		this.map.context.fillStyle = 'blue';
		for (var i = 0; i < 4; i++) {
			var pos = this.map.transform(this.route.getPoint((i + 1) / 4));
			this.map.context.dot(pos.x, pos.y, 2);
		}
	},
	
	update: function() {
		this.points = this.map.transformAll(this.route.points);
		
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
	
	rotate: function() {
		this.update();
	},
	
	zoom: function() {
		this.visible = false;
		this.gradients = [];
		
		this.update();
		
		for (var i = 0; i < this.points.length - 1; ++i) {
			var start = this.points[i];
			var target = this.points[i + 1];
			this.gradients.push(this.createGradient(start, target));
		}
	},
	
	createGradient: function(start, target) {
		var rad = 400;
		
		var gradient = this.map.context.createLinearGradient(start.x, start.y, target.x, target.y);
		var modified = false;
		if (start.abs() < rad && target.abs() < rad){
			gradient.addColorStop(0, 'white');
			modified = true;
		} else {
			var directionVector = target.sub(start);
			var p = directionVector.dot(start) / directionVector.dot(directionVector);
			var q = (start.dot(start) - rad * rad)/directionVector.dot(directionVector);
			var sqrt = Math.sqrt(p * p - q);
			
			if (sqrt !== Number.NaN){
				var out = -p + sqrt; 
				var into = -p - sqrt;
			
				if (start.abs() > rad && 0 < into && into < 1){
			  		gradient.addColorStop( 0, 'transparent');
			  		gradient.addColorStop( into, 'transparent');
			  		gradient.addColorStop( into, 'white');
			  		modified = true;
				}
				
				if (target.abs() > rad && 0 < out && out < 1){
					if (!modified) {				
						gradient.addColorStop( 0, 'white');
					}
					
					gradient.addColorStop( out, 'white');
					gradient.addColorStop( out, 'transparent');
					modified = true;
				}
			}
				
			if (!modified) {
				gradient.addColorStop(0, 'transparent');
			}
			
		}
		
		this.visible |= modified;
		
		return gradient;
	}
});

var MapRoutePoint = MapComponent.inherit({
	initialize: function(index, point) {
		this.superCall();
		
		this.index = index;
		this.point = point;
	}
});