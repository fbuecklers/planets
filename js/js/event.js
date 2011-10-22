var EventTarget = Object.inherit({
	/**
	 * @constructor
	 * @memberOf EventTarget
	 */
	initialize: function() {
		this.listeners = [{}, {}];
	},
	
	addListener: function(type, listener, useCapture) {
		var listeners = this.listeners[Number(!useCapture)][type];
		if (!listeners) {
			this.listeners[Number(!useCapture)][type] = [listener];
		} else if (listeners.indexOf(listener) == -1) {			
			listeners.push(listener);
		}
	},
	
	removeListener: function(type, listener, useCapture) {
		var listeners = this.listeners[Number(!useCapture)][type];
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
		
		this.callListeners(evt, true);
		this.callListeners(evt, false);
		
		return evt.defaultPrevented;
	},
	
	/**
	 * 
	 * @param {Event} evt
	 * @param {Boolean} useCapture
	 * @returns {Boolean}
	 */
	callListeners: function(evt, useCapture) {
		evt.currentTarget = this;
		
		if (evt.target == this) {
			evt.eventPhase = Event.AT_TARGET; 
		} else if (useCapture) {
			evt.eventPhase = Event.CAPTURING_PHASE;
		} else {
			evt.eventPhase = Event.BUBBLING_PHASE;
		}
		
		var listeners = this.listeners[Number(!useCapture)][evt.type];
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

