var Star = Object.inherit({
	/**
	 * @constructor
	 * @memberOf Star
	 * @param position  
	 * @param type
	 * @param name
	 */
	initialize: function(position, name, type, planets) {
		this.position = position;
		this.type = type;
		this.name = name;
		this.planets = planets
	}
});


var Planet = Object.inherit({
	/**
	 * @constructor
	 * @memberOf Planet
	 * @param star  
	 * @param radius
	 * @param type
	 */
	initialize: function(star, radius, type) {
		this.star = star;
		this.radius = radius;
		this.typ = typ;
	}
});