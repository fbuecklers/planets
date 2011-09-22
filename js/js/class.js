Function.Empty = function() {};

/**
 * 
 * @param objectDescriptor
 * @returns {any}
 */
Function.prototype.inherit = function(objectDescriptor) {
	var klass = function(objectToCast) {
		if (!(this instanceof klass)) {
			return objectToCast instanceof klass? objectToCast: null;
		}
		
		this.initialize.apply(this, arguments);
	};
	
	objectDescriptor.constructor = klass;
	
	var proto = klass.prototype = Object.create(this.prototype);
	proto.constructor = this;
	
	for (var name in objectDescriptor) {
		if (objectDescriptor.hasOwnProperty(name)) {
			var d = objectDescriptor[name];
			
			if (!d || !(d.hasOwnProperty('get') || d.hasOwnProperty('set') || d.hasOwnProperty('value'))) {				
				proto[name] = d;
				
				if (d instanceof Function)
					d.methodName = name;
				
				delete objectDescriptor[name];
			}
		}
	}
	
	Object.defineProperties(proto, objectDescriptor);
	
	if (proto.initialize === undefined)
		proto.initialize = Function.Empty;
	
	return klass;
};

Object.defineProperty(Object.prototype, 'superCall', {
	enumerable: false,
	value: function() {
		var caller = arguments.callee.caller;
		
		if (caller && caller.methodName) {
			var methodName = caller.methodName;
			
			var proto = this;
			while (!proto.hasOwnProperty(methodName) || proto[methodName] != caller) {
				proto = Object.getPrototypeOf(proto);
			}
			proto = Object.getPrototypeOf(proto);
			
			return proto[caller.methodName].apply(this, arguments);
		}
	//		var obj = this, methodName = null;
	//		while (superMethod == null && obj != Object.prototype) {
	//			if (methodName == null) {
	//				var names = Object.getOwnPropertyNames(obj);
	//				for (var i = 0, name; name = names[i]; ++i) {
	//					if (obj[name] == caller) {
	//						methodName = name;
	//						break;
	//					}
	//				}
	//			} else if (obj.hasOwnProperty(methodName)) {
	//				superMethod = obj[methodName];
	//			}
	//			
	//			obj = obj.constructor.prototype;
	//		}
	//	}
		
		else {		
			throw new ReferenceError("superCall can not be called outside of object inheritance");
		}
	//	
	//	return superMethod.apply(this, arguments);
	}
});

