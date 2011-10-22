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
	
	callListeners: function(evt, useCapture) {
		if (useCapture) {
			if (this.parentComponent && this.parentComponent.callListeners(evt, useCapture)) {
				return true;
			} else {
				return this.superCall(evt, useCapture);								
			}
		} else {
			if (this.superCall(evt, useCapture)) {
				return true;
			} else if (evt.bubbles && this.parentComponent) {
				return this.parentComponent.callListeners(evt, useCapture);
			} else {
				return false;
			}
		}
	}
});

var ElementComponent = Component.inherit({
	initialize: function(element) {
		this.superCall();
		
		if (element) {
			element.component = this;
			this.element = element;
		}
	},
	
	getComponent: function(x, y) {
		return this;
	}
});

var DocumentComponent = ElementComponent.inherit({
	initialize: function() {
		this.superCall(document);
		
		this.currentComponent = this;
		this.activeComponent = this;
		
		this.handleOver = true;
		this.mousePosition = null;

		this.element.addEventListener('mousedown', this.onBeginMove, false);
		this.element.addEventListener('mousemove', this.onMouseMove, false);
		this.element.addEventListener('click', this.onClick, false);
		this.element.addEventListener('mousewheel', this.onWheel, false);
		this.element.addEventListener('DOMMouseScroll', this.onWheel, false);
	},
	
	onClick: function(e) {
		this.updateMousePosition(e);
		
		if (this.activeComponent != this.currentComponent) {			
			var lastActiveComponent = this.activeComponent;
			this.activeComponent = this.currentComponent;
			
			var evt = new MapEvent('inactive', this.mousePosition);
			if (lastActiveComponent.dispatchEvent(evt)) {
				e.preventDefault();
			}
			
			evt = new MapEvent('active', this.mousePosition);
			if (this.currentComponent.dispatchEvent(evt)) {
				e.preventDefault();
			}
		}
	},
	
	onWheel: function(e) {
		this.updateMousePosition(e);
		
		var direction = e.wheelDelta? e.wheelDelta: -e.detail;
		var delta = direction > 0? 2: -2;
		
		this.handleOver = false;
		
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(this.onWheelTimer, 200);
		
		var evt = new MapEvent('wheel', this.mousePosition, delta);
		if (this.currentComponent.dispatchEvent(evt)) {
			e.preventDefault();
		}
	},
	
	onWheelTimer: function() {
		this.handleOver = true;

		var evt = new MapEvent('endWheel', this.mousePosition);
		this.currentComponent.dispatchEvent(evt);
	},
	
	onMouseMove: function(e) {
		this.updateMousePosition(e);
		
		if (this.handleOver) {			
			var lastComponent = this.currentComponent;
			this.updateCurrentComponent(e);
			
			if (this.currentComponent != lastComponent) {				
				var evt = new MapEvent('out', this.mousePosition);
				lastComponent.dispatchEvent(evt);
				
				evt = new MapEvent('over', this.mousePosition);
				this.currentComponent.dispatchEvent(evt);
			}
		}
	},
	
	onBeginMove: function(e) {
		this.updateMousePosition(e);
		this.beginMousePosition = this.mousePosition;
		
		this.element.addEventListener('mousemove', this.onMove, false);
		this.element.addEventListener('mouseup', this.onEndMove, false);
		this.element.removeEventListener('mousemove', this.onMouseMove, false);
		
		var evt = new MapEvent('beginMove', this.mousePosition);
		this.currentComponent.dispatchEvent(evt);

		e.preventDefault();
	},
	
	onMove: function(e) {
		var lastMousePosition = this.mousePosition;
		this.updateMousePosition(e);
		
		if (this.beginMousePosition.sub(this.mousePosition).abs() > 5)
			this.element.removeEventListener('click', this.onClick, false);
		
		var evt = new MapEvent('move', this.mousePosition, this.mousePosition.sub(lastMousePosition));
		if (this.currentComponent.dispatchEvent(evt)) {
			e.preventDefault();
		}
	},
	
	onEndMove: function(e) {
		this.updateMousePosition(e);
		
		this.element.removeEventListener('mousemove', this.onMove, false);
		this.element.removeEventListener('mouseup', this.onEndMove, false);
		this.element.addEventListener('mousemove', this.onMouseMove, false);
		
		var evt = new MapEvent('endMove', this.mousePosition);
		if (this.currentComponent.dispatchEvent(evt)) {
			e.preventDefault();
		}
		
		window.setTimeout(this.onEnableClick, 10);
	},
	
	onEnableClick: function() {
		this.element.addEventListener('click', this.onClick, false);
	},
	
	updateMousePosition: function(e) {
		this.mousePosition = new Vector(e.pageX, e.pageY);
	},
	
	updateCurrentComponent: function(e) {
		var element = e.target;
		while (!element.component && element.parentNode) {
			element = element.parentNode;
		}
		
		var component = element.component;
		if (!component) {
			component = this;
			element = this.element;
		}
		
		var offset = new Vector(element.offsetLeft, element.offsetTop);
		this.currentComponent = component.getComponent(this.mousePosition.sub(offset));
		if (!this.currentComponent)
			this.currentComponent = component;
	}
});

var MapEvent = Event.inherit({
	initialize: function(type, mouse, mouseDelta) {
		this.initEvent(type, true, true);
		this.mouse = mouse? mouse: null;
		this.mouseDelta = mouseDelta? mouseDelta: 0;
	}
});