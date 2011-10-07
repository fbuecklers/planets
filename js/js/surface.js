var Field = Object.inherit({
	initialize: function(index,w,h){
		this.eisen;
		this.silizium;
		this.kohlenstof;
		this.wasser;
		this.deuterium;
		this.platinmetalle;
		this.naquada;
		this.selteneErden;
		
		this.belegt;
		this.index = index
		this.w = w
		this.h = h
	}
});

var Building = Object.inherit({
	initialize: function(type){
		this.type = type;
		this.level = 1;
		this.position = null;
		this.people = 0;
	}
	
});


var PlanetSurface = Object.inherit({
	initialize: function(width, height){
		this.width = width;
		this.height = height;
		this.buildings = [];
		this.fields = [];
	for (var i = 0; i < height; ++i){
		for (var j=0; j<width;++j){
			this.fields[i*width+j] = new Field(i*width+j,j,i);
			
		}
	}
	
	},
	
	addBuilding: function(newBuilding){
		this.building;
	},
	removeBuilding: function(building){}
	
});
var SurfaceMapField = Component.inherit({
	initialize: function(field, building){
		
		this.building = building? building:null;
		this.field = field;
	}
});

var SurfaceMap = Component.inherit({
	initialize: function(planetSurface, element){
		this.superCall();
		
		this.planetSurface = planetSurface;
		this.element = element;
		this.context = element.getContext('2d');
		this.offsetY = 0;
		this.offsetX = 0;
		this.fieldSize = Math.sqrt(164)
		this.eventDispatcher = new EventDispatcher(this);
		
		this.wAxis = new Vector(10, 8);
		this.hAxis = new Vector(-10, 8);
	},
	
	getComponent: function(x, y) {
		
	},
	
	over: function(e) {
		console.log(e.mouse);
	},
	
	beginMove: function(e) {
		e.preventDefault();
	},
	
	move: function(e) {
		e.preventDefault();
		var m = e.mouse;
		
		var dh = (this.wAxis.x * m.x - this.wAxis.y * m.y);
		dh /= (this.hAxis.x * this.wAxis.y - this.hAxis.y * this.wAxis.x);
		
		var dw = (m.x - dh * this.hAxis.x) / this.wAxis.x; 
		
		var h = Math.floor(dh), w = Math.floor(dw);
		
//		e.mouse.abs() / Math.atan(.8)
//		
//		var w = this.wAxis.dot(e.mouse) / Math.cos(secangle);
//		var h = this.hAxis.dot(e.mouse) / Math.cos(angle);
		
//		var distanceOfTLtoBR = e.mouse.dot(new Vector(1, .8).normalize());
//		var distanceOfTRtoBL = e.mouse.dot(new Vector(-1, .8).normalize());
//		var h = (Math.floor(distanceOfTLtoBR / this.fieldSize)+this.planetSurface.height)%this.planetSurface.height
//		var w = (Math.floor(distanceOfTRtoBL / this.fieldSize)+this.planetSurface.width)%this.planetSurface.width		
//		console.log(h*this.planetSurface.width+w);
		var index = h * this.planetSurface.width + w;
		console.log(w, h, index);
		
		this.draw()
		this.drawField(this.planetSurface.fields[index]);
		
	},


//		console.log(Math.floor(e.mouse.y/20+(e.mouse.x%20))*this.planetSurface.width+Math.floor(e.mouse.x/20));
	onClick: function(e) {
		
		e.mouse
	},
	
	endMove: function(e) {
//		e.preventDefault();
	},
	
	draw: function(){
		this.context.clearRect(0, 0, 800, 800);

		this.context.beginPath();
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 0.5;
		for (var i=0;i<1800;i+=20){
			this.context.moveTo(-1000+i, 0);
			this.context.lineTo(0+i, 800);

			this.context.moveTo(1800-i, 0);
			this.context.lineTo(800-i, 800);

		}
		this.context.stroke();
		
		this.context.beginPath();
		this.context.strokeStyle = 'green';
		this.context.lineWidth = 2;
		this.context.moveTo(400, 400);
		var w = this.hAxis.scalar(400);
		this.context.lineTo(400 + w.x, 400 + w.y);
		this.context.stroke();

//		for (var i=0,field; field = this.planetSurface.fields[i]; i+=10){
//		var field = this.planetSurface.fields[0];
//			this.drawField(field);
//		}
	},
	drawField: function(field) {
		var x = (field.h * -10 + field.w * 10 + 400)%800; 
		var y = (field.h * 8 + field.w * 8 + 400)%800;
		
		this.context.fillStyle = 'red';
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.lineTo(x + 10, y + 8);
		this.context.lineTo(x, y + 16);
		this.context.lineTo(x - 10, y + 8);
		this.context.closePath();
		this.context.fill();
	},
	wheel: function(){},
	endWheel: function(){}
});

window.onload = function() {
	var test = new SurfaceMap(new PlanetSurface(50, 50), document.getElementById('planets'));
	test.draw();
}
