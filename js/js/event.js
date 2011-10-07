var EventTarget = Object.inherit({
	/**
	 * @constructor
	 * @memberOf EventTarget
	 */
	initialize: function() {
		this.eventListeners = [{}, {}];
	},
	
	addEventListener: function(type, listener, useCapture) {
		var listeners = this.eventListeners[Number(!useCapture)][type];
		if (!listeners) {
			this.eventListeners[Number(!useCapture)][type] = [listener];
		} else if (listeners.indexOf(listener) == -1) {			
			listeners.push(listener);
		}
	},
	
	removeEventListener: function(type, listener, useCapture) {
		var listeners = this.eventListeners[Number(!useCapture)][type];
		if (listeners) {
			var index = listeners.indexOf(listener);
			if (index != -1) {				
				listeners.splice(index, 1);
			}
		}
	},
	
	/**
	 * 
	 * @param {Event} evt
	 * @returns {Boolean}
	 */
	dispatchEvent: function(evt) {
		evt.target = this;
		
		this.dispatchEventListeners(evt, true);
		this.dispatchEventListeners(evt, false);
		
		return evt.defaultPrevented;
	},
	
	/**
	 * 
	 * @param {Event} evt
	 * @param {Boolean} useCapture
	 * @returns {Boolean}
	 */
	dispatchEventListeners: function(evt, useCapture) {
		evt.currentTarget = this;
		
		if (evt.target == this) {
			evt.eventPhase = Event.AT_TARGET; 
		} else if (useCapture) {
			evt.eventPhase = Event.CAPTURING_PHASE;
		} else {
			evt.eventPhase = Event.BUBBLING_PHASE;
		}
		
		var listeners = this.eventListeners[Number(!useCapture)][evt.type];
		if (listeners) {			
			for (var i = 0, l; (l = listeners[i]) && !evt.propagationImmediateStopped; ++i) {				
				l.call(this, evt);
			}
		}
		
		return evt.propagationStopped;
	}
});

var Event = Object.inherit({
	/**
	 * @constructor
	 * @memberOf Event
	 * @param {String} type
	 * @param {Boolean} bubbles
	 * @param {Boolean} cancelable
	 */
	initEvent: function(type, bubbles, cancelable) {
		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
		
		this.target = null;
		this.currentTarget = null;
		this.eventPhase = -1;
		this.timeStamp = null;
		this.defaultPrevented = false;
		this.propagationStopped = false;
		this.propagationImmediateStopped = false;
		this.isTrusted = false;
	},
	
	stopPropagation: function() {
		this.propagationStopped = true;
	},
	
	stopImmediatePropagation: function() {
		this.propagationStopped = true;
		this.propagationImmediateStopped = true;
	},
	
	preventDefault: function() {
		if (this.cancelable) {
			this.defaultPrevented = true;
		}
	}
});

Event.CAPTURING_PHASE = 1;
Event.AT_TARGET = 2;
Event.BUBBLING_PHASE = 3;

var EventDispatcher = Object.inherit({
	initialize: function(map) {
		this.map = map;
		this.element = map.element;
		this.currentComponent = map;
		
		this.handleOver = true;
		this.mousePosition = null;

		this.element.addEventListener('mousedown', this.onBeginMove, false);
		this.element.addEventListener('mousemove', this.onMouseMove, false);
		this.element.addEventListener('mousewheel', this.onWheel, false);
		this.element.addEventListener('DOMMouseScroll', this.onWheel, false);
	},
	
	onWheel: function(e) {
		this.updateMousePosition(e);
		
		var direction = e.wheelDelta? e.wheelDelta: -e.detail;
		var delta = direction > 0? 2: -2;
		
		this.handleOver = false;
		
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(this.onWheelTimer, 1000);
		
		var evt = new MapEvent('wheel', this.mousePosition, delta);
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.map.wheel(evt);
		}
		
		e.preventDefault();
	},
	
	onWheelTimer: function(e) {
		this.handleOver = true;

		var evt = new MapEvent('endWheel', this.mousePosition);
		if (!this.map.dispatchEvent(evt)) {
			this.map.endWheel(evt);
		}
	},
	
	onMouseMove: function(e) {
		this.updateMousePosition(e);
		
		if (this.handleOver) {			
			var lastComponent = this.currentComponent;
			this.currentComponent = this.map.getComponent(this.mousePosition.x, this.mousePosition.y);
			if (!this.currentComponent) {
				this.currentComponent = this.map;
			}
			
			if (this.currentComponent != lastComponent) {				
				var evt = new MapEvent('out', this.mousePosition);
				lastComponent.dispatchEvent(evt);
				
				evt = new MapEvent('over', this.mousePosition);
				if (!this.currentComponent.dispatchEvent(evt)) {
					this.map.over(evt);
				}
			}
		}
	},
	
	onBeginMove: function(e) {
		this.updateMousePosition(e);
		
		document.addEventListener('mousemove', this.onMove, false);
		document.addEventListener('mouseup', this.onEndMove, false);
		this.element.removeEventListener('mousemove', this.onMouseMove, false);
		
		var evt = new MapEvent('beginMove', this.mousePosition);
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.map.beginMove(evt);
		}
	},
	
	onMove: function(e) {
		this.updateMousePosition(e);
		
		var evt = new MapEvent('move', this.mousePosition);
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.map.move(evt);
		}
	},
	
	onEndMove: function(e) {
		this.updateMousePosition(e);
		
		document.removeEventListener('mousemove', this.onMove, false);
		document.removeEventListener('mouseup', this.onEndMove, false);
		this.element.addEventListener('mousemove', this.onMouseMove, false);
		
		var evt = new MapEvent('endMove', this.mousePosition);
		if (!this.currentComponent.dispatchEvent(evt)) {
			this.map.endMove(evt);
		}
	},
	
	updateMousePosition: function(e) {
		var x = e.clientX - this.element.offsetLeft - 400;
		var y = e.clientY - this.element.offsetTop - 400; 
		this.mousePosition = new Vector(x, y);
	},
});

var MapEvent = Event.inherit({
	initialize: function(type, mouse, mouseDelta) {
		this.initEvent(type, true, true);
		this.mouse = mouse? mouse: null;
		this.mouseDelta = mouseDelta? mouseDelta: 0;
	}
});

