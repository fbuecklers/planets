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
		
		this.context.translate(400, 400);
		
		this.offsetField = this.planetSurface.fields[0];
		this.offset = new Vector(0, 0);
		
		this.offsetW = 0;
		this.offsetH = 0;
		this.fieldSize = Math.sqrt(164);
		this.eventDispatcher = new EventDispatcher(this);
		
		this.wAxis = new Vector(10, 8);
		this.hAxis = new Vector(-10, 8);
		
		for (var i = 0, field; field = this.planetSurface.fields[i]; ++i) {
			this.addComponent(new SurfaceMapField(field));
		}
	},
	
	getComponent: function(x, y) {
		y -= this.offset.y;
		x -= this.offset.x;
		
		return this.getComponentAtPoint(x, y);
	},
	
	getComponentAtPoint: function(x, y) {
		var dh = (this.wAxis.y * x - this.wAxis.x * y);
		dh /= (this.hAxis.x * this.wAxis.y - this.hAxis.y * this.wAxis.x);
		
		var dw = (x - dh * this.hAxis.x) / this.wAxis.x; 
		
		var w = (Math.floor(dw) + this.offsetField.w + this.planetSurface.width) % (this.planetSurface.width);
		var h = (Math.floor(dh) + this.offsetField.h + this.planetSurface.height) % (this.planetSurface.height);
//		if (w < 0 || h < 0 || w > 47 || h > 47)
//			return null;
		
		return this.components[h * this.planetSurface.width + w];
	},
	
	over: function(e) {
		if (e.target != this) {			
			this.draw();
			this.drawField(e.target.field);
		}
	},
	
	click: function(e) {
//		console.log(this.offsetX, this.offsetY);
//		console.log(this.offsetField.w, this.offsetField.h);
		console.log(e.target.field.w, e.target.field.h, e.target.field.index);
	},
	
	beginMove: function(e) {
		e.preventDefault();
		this.last = e.mouse.sub(this.offset);
	},
	
	move: function(e) {
		var mouse = e.mouse.sub(this.offset);
		var diff = this.last.sub(mouse);
		console.log(mouse, diff, this.offset);
		var oldField = this.offsetField;
		this.offsetField = this.getComponentAtPoint(diff.x, diff.y).field;
		
		var wField = (this.offsetField.w - oldField.w);
		var hField = (this.offsetField.h - oldField.h);
		
		var x = hField * -10 + wField * 10;
		var y = hField * 8 + wField * 8;
		
		x = (diff.x - x) % 20;
		if (x < 0)
			x += 20;
		
		y = (diff.y - y) % 16;
		if (y < 0)
			y += 16;
		
		this.offset = new Vector(x, y);
		console.log(x,y, this.offset, this.offsetField);
		this.draw();
		
		this.last = mouse;
	},
	
	endMove: function(e) {
		e.preventDefault();
	},
	
	draw: function(){
		this.context.clearRect(0, 0, 800, 800);

		this.context.beginPath();
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 0.5;
		for (var i = 0; i < 49; i++){
			this.context.moveTo(-i * 10 + this.offset.x, -384 + i * 8 + this.offset.y);
			this.context.lineTo(480 - i * 10 + this.offset.x, i * 8 + this.offset.y);

			this.context.moveTo(i * 10 + this.offset.x, -384 + i * 8 + this.offset.y);
			this.context.lineTo(-480 + i * 10 + this.offset.x, i * 8 + this.offset.y);
		}
		
		this.context.stroke();
		
		this.drawField(new Field(2020,20,20));


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
//		var x = 400 + (((field.h * -10 + field.w * 10) + this.offsetX) % (this.planetSurface.width * 20)); 
//		var y = (((field.h * 8 + field.w * 8) + this.offsetY) % (this.planetSurface.height * 16)) - 64;
		var h = ((this.offsetField.h + field.h + 24) % this.planetSurface.height) - 24;
		var w = ((this.offsetField.w + field.w + 24) % this.planetSurface.width) - 24;
		
		var x = h * -10 + w * 10 + this.offset.x; 
		var y = h * 8 + w * 8 + this.offset.y;
		
		this.context.fillStyle = 'red';
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.lineTo(x + 10, y + 8);
		this.context.lineTo(x, y + 16);
		this.context.lineTo(x - 10, y + 8);
		this.context.closePath();
		this.context.fill();
	}
});

window.onload = function() {
	var test = new SurfaceMap(new PlanetSurface(100, 100), document.getElementById('planets'));
	test.draw();
};
