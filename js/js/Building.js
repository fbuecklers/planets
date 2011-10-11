var Housing = Building.inherit({
	
	name: 'Wohngebiet',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
		this.radius = 10;
	}
});

var Mine = Building.inherit({
	
	name: 'Mine',
	size: [[8,4,10,9],[15,10,12,7],[14,10,6,15]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});

var Factory = Building.inherit({

	name: 'Fabrik',
	size: [[10,12,10],[15,18,15],[18,21,18],[0,25,0]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});

var Acadamy = Building.inherit({
	
	name: 'Akademie',
	size: [[10,7,12,6],[15,20,10,15],[14,10,12,8],[4,12,10,8]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});

var Refinery = Building.inherit({
	
	name: 'Raffinerie',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});

var Laboratory = Building.inherit({
	
	name: 'Forschungsanstalt',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});

var PowerStation = Building.inherit({
	
	name: 'Kraftwerk',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
		this.type = xxx;
	}
});

var Spaceport = Building.inherit({
	
	name: 'Raumhafen',
	size: [[5,8,5,20,20],[5,8,10,20,20],[4,6,5,5,9],[5,6,3,8,5]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
	}
});
