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
		this.index = index;
		this.w = w;
		this.h = h;
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
				this.fields[i*width+j] = new Field(i*width+j, j, i);
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
		this.superCall();
		
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
		this.fieldSize = Math.sqrt(164);
		this.eventDispatcher = new EventDispatcher(this);
		
		this.wAxis = new Vector(10, 8);
		this.hAxis = new Vector(-10, 8);
		
		for (var i = 0, field; field = this.planetSurface.fields[i]; ++i) {
			this.addComponent(new SurfaceMapField(field));
		}
	},
	
	getComponent: function(x, y) {
		y += 464 + this.offsetY;
		x += this.offsetX;
		var dh = (this.wAxis.y * x - this.wAxis.x * y);
		dh /= (this.hAxis.x * this.wAxis.y - this.hAxis.y * this.wAxis.x);
		
		var dw = (x - dh * this.hAxis.x) / this.wAxis.x; 
		
		var w = Math.floor(dw);
		var h = Math.floor(dh);
		console.log(w, h);
		//if (w < 0 || h < 0 || w > 47 || h > 47)
			return null;
		
		return this.components[h * this.planetSurface.width + w];
	},
	
	over: function(e) {
		if (e.target != this) {			
			this.draw();
			this.drawField(e.target.field);
		}
	},
	
	click: function(e) {
		console.log(e.target.field);
	},
	
	beginMove: function(e) {
		e.preventDefault();
		this.last = e.mouse;
	},
	
	move: function(e) {
		var diff = e.mouse.sub(this.last);
		if (diff.x){
			this.offsetX += diff.x;
			this.offsetX = this.offsetX % (this.planetSurface.width * 20);
		}
		if (diff.y){
			this.offsetY += diff.y;
			this.offsetY = this.offsetY % (this.planetSurface.height * 16);
		}
		this.draw();
		this.last = e.mouse
	},
	
	endMove: function(e) {
		e.preventDefault();
	},
	
	draw: function(){
		this.context.clearRect(0, 0, 800, 800);

		this.context.beginPath();
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 0.5;
		for (var i = -4; i < 45; i++){
			this.context.moveTo(360 - i * 10 + (this.offsetX % 20), i * 8 - 32 + (this.offsetY % 16));
			this.context.lineTo(840 - i * 10 + (this.offsetX % 20), 352 + i * 8 + (this.offsetY % 16));

			this.context.moveTo(440 + i * 10 + (this.offsetX % 20), i * 8 - 32 + (this.offsetY % 16));
			this.context.lineTo(i * 10 - 40 + (this.offsetX % 20), 352 + i * 8 + (this.offsetY % 16));
		}
		var h = 1;
		var w = 1;
		var x = 400 + (h * -10 + w * 10) + this.offsetX; 
		var y = (h * 8 + w * 8) - 64 + this.offsetY;
		this.context.stroke();
		this.context.fillStyle = 'red';
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.lineTo(x + 10, y + 8);
		this.context.lineTo(x, y + 16);
		this.context.lineTo(x - 10, y + 8);
		this.context.closePath();
		this.context.fill();
//		
//		this.context.beginPath();
//		this.context.strokeStyle = 'green';
//		this.context.lineWidth = 2;
//		this.context.moveTo(400, 400);
//		var w = this.hAxis.scalar(400);
//		this.context.lineTo(400 + w.x, 400 + w.y);
//		this.context.stroke();
		
//		for (var i=0,field; field = this.planetSurface.fields[i]; i+=10){
//		var field = this.planetSurface.fields[0];
//			this.drawField(field);
//		}
	},
	
	drawField: function(field) {
//		var x = 400 + (field.h * -10 + field.w * 10) - this.offsetX; 
//		var y = (field.h * 8 + field.w * 8) - 64 - this.offsetY;
		
//		this.context.fillStyle = 'red';
//		this.context.beginPath();
//		this.context.moveTo(x, y);
//		this.context.lineTo(x + 10, y + 8);
//		this.context.lineTo(x, y + 16);
//		this.context.lineTo(x - 10, y + 8);
//		this.context.closePath();
//		this.context.fill();
	}
});

window.onload = function() {
	var test = new SurfaceMap(new PlanetSurface(100, 100), document.getElementById('planets'));
	test.draw();
};
