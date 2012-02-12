Function.Empty = function() {};

/**
 * 
 * @param objectDescriptor
 * @returns {any}
 */
Function.prototype.inherit = function(objectDescriptor) {
	var klass = function(objectToCast) {
		if (!(this instanceof klass)) {
			return proto.cast(objectToCast);
		}
		
		if (eventHandlers) {
			for (var name in eventHandlers)
				this[name] = eventHandlers[name].bind(this);
		}
		
		this.initialize.apply(this, arguments);
	};
	
	if (objectDescriptor.initialize && !/\WsuperCall\s*\(/.test(objectDescriptor.initialize.toString())) {
		var initialize = objectDescriptor.initialize;
		objectDescriptor.initialize = function() {
			this.superCall();
			initialize.apply(this, arguments);
		};
	}
	
	var eventHandlers = klass.eventHandlers = {};
	if (this.eventHandlers) {
		for (name in this.eventHandlers)
			eventHandlers[name] = this.eventHandlers[name];
	}
	
	var proto = klass.prototype = Object.create(this.prototype);
	proto.constructor = klass;
	
	for (var name in objectDescriptor) {
		if (objectDescriptor.hasOwnProperty(name)) {
			var d = objectDescriptor[name];
			
			if (!d || !(d.hasOwnProperty('get') || d.hasOwnProperty('set') || d.hasOwnProperty('value'))) {				
				proto[name] = d;
				
				if (d instanceof Function) {
					d.methodName = name;
					if (name.indexOf('on') === 0) {
						eventHandlers[name] = d; 
					}
				}
			} else {
				Object.defineProperty(proto, name, d);
			}
		}
	}
	
	if (proto.initialize === undefined)
		proto.initialize = Function.Empty;
	
	return klass;
};

Object.defineProperty(Object.prototype, 'superCall', {
	enumerable: false,
	value: function superCall() {
		var caller = superCall.caller;
		
		if (caller && caller.methodName) {
			var methodName = caller.methodName;
			
			var proto = this;
			while (!proto.hasOwnProperty(methodName) || proto[methodName] !== caller) {
				proto = Object.getPrototypeOf(proto);
			}
			proto = Object.getPrototypeOf(proto);
			
			return proto[caller.methodName].apply(this, arguments);
		} else {		
			throw new ReferenceError("superCall can not be called outside of object inheritance");
		}
	}
});

Object.defineProperty(Object.prototype, 'cast', {
	enumerable: false,
	value: function(objectToCast) {
		return objectToCast instanceof this.constructor? objectToCast: null;
	}
});

