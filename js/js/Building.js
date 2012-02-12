var buildings = {};

buildings.Building = Object.inherit({
	initialize: function(){
		this.level = 1;
		this.position = null;
		this.people = 0;
	}
});

buildings.Housing = buildings.Building.inherit({
	
	name: 'Wohngebiet',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function() {
		this.level = 1;
		this.maxworkers = 200;
		this.radius = 10;
		this.currentworkers = 0;
		this.energy = 20;
		this.growth = 0;
	}
});

buildings.Mine = buildings.Building.inherit({
	
	name: 'Mine',
	size: [[8,4,10,9],[15,10,12,7],[14,10,6,15]],
	
	initialize: function(type){
		this.level = 1;
		this.maxworkers = 200;
		this.radius = 10;
		this.currentworkers = 0;
		this.energy = 20;
		this.production = 5;
		this.type = type;
	}
});

buildings.Factory = buildings.Building.inherit({

	name: 'Fabrik',
	size: [[10,12,10],[15,18,15],[18,21,18],[0,25,0]],
	
	initialize: function(){
		this.level = 1;
		this.maxworkers = 20;
		this.radius = 10;
		this.currentworkers = 0;
		this.energy = 20;
		this.consumption = [];
		this.production = 5;
		this.job = null;
	}
});

buildings.Acadamy = buildings.Building.inherit({
	
	name: 'Akademie',
	size: [[10,7,12,6],[15,20,10,15],[14,10,12,8],[4,12,10,8]],
	
	initialize: function(){
		this.level = 1;
		this.maxworkers = 200;
		this.radius = 10;
		this.currentworkers = 0;
		this.energy = 20;
		this.job = null;
		this.teams = [];
		this.bonus = 1;
	}
});

buildings.Refinery = buildings.Building.inherit({
	
	name: 'Raffinerie',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.maxworkers = 200;
		this.radius = 10;
		this.currentworkers = 0;
		this.energy = 20;
		this.consumption = 5;
		this.production = 5;
	}
});

buildings.Laboratory = buildings.Building.inherit({
	
	name: 'Forschungsanstalt',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.level = 1;
		this.radius = 10;
		this.currentworkers = 0;
		this.maxworkers = 200;
		this.energy = 20;
	}
});

buildings.PowerStation = buildings.Building.inherit({
	
	name: 'Kraftwerk',
	size: [[10,14,12],[15,20,10],[14,10,12]],
	
	initialize: function(){
		this.radius = 10;
		this.level = 1;
		this.energy = 0;
		this.maxworkers = 200;
		this.currentworkers = 0;
	}
});

buildings.Spaceport = buildings.Building.inherit({
	
	name: 'Raumhafen',
	size: [[5,8,5,20,20],[5,8,10,20,20],[4,6,5,5,9],[5,6,3,8,5]],
	
	initialize: function(){
		this.level = 1;
		this.people = 0;
		this.ports = 1;
		this.plains = [];
		this.energy = 20;
		this.currentworkers = 0;
		this.maxworkers = 200;
		
	}
});
