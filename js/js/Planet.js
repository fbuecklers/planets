var Star = Object.inherit({
	/**
	 * @constructor
	 * @memberOf Star
	 * @param position  
	 * @param type
	 * @param name
	 */
	initialize: function(position, normal, name, type) {
		this.position = position;
		this.normal = normal;
		this.type = type;
		this.name = name;
		this.planets = [];
		
		this.image = new Image();
		this.image.src = 'img/sonne.png';
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
	initialize: function(star, normal, position, radius, days, img, type) {		
		this.star = star;
		this.normal = normal;
		this.position = position;
		this.radius = radius;
		this.days = days;
		
		this.image = new Image();
		this.image.src = img;
		this.type = type;
	}
});