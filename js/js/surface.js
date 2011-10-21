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
		
		this.offset = new Vector(0, 0);
		
		this.eventDispatcher = new EventDispatcher(this);
		
		this.wAxis = new Vector(10, 8);
		this.hAxis = new Vector(-10, 8);
		
		for (var i = 0, field; field = this.planetSurface.fields[i]; ++i) {
			this.addComponent(new SurfaceMapField(field));
		}
		
		window.addEventListener('resize', this.onResize, false);
		
		this.onResize();
	},
	
	getComponent: function(x, y) {
		var v = this.getSurfaceVector(new Vector(x, y)).sub(this.offset);
		
		var w = Math.floor(v.x + this.planetSurface.width) % this.planetSurface.width;
		var h = Math.floor(v.y + this.planetSurface.height) % this.planetSurface.height;
		
		return this.components[h * this.planetSurface.width + w];
	},
	
	getSurfaceVector: function(v) {
		var dh = (this.wAxis.y * v.x - this.wAxis.x * v.y);
		dh /= (this.hAxis.x * this.wAxis.y - this.hAxis.y * this.wAxis.x);
		
		var dw = (v.x - dh * this.hAxis.x) / this.wAxis.x; 
		
		return new Vector(dw, dh);
	},
	
	getMapVector: function(v) {
		var x = v.x * this.wAxis.x + v.y * this.hAxis.x; 
		var y = v.x * this.wAxis.y + v.y * this.hAxis.y;
		
		return new Vector(x, y);
	},
	
	onResize: function(e) {
		this.resize(window.innerWidth, window.innerHeight);
	},
	
	resize: function(width, height) {
		this.element.width = width; 
		this.element.height = height;
		
		var wLines = Math.floor(width / (this.wAxis.x * 2)) + 2;
		var hLines = Math.floor(height / (this.wAxis.y * 2)) + 2;
		
		this.lines = wLines > hLines? wLines: hLines;
		
		this.context.setTransform(1, 0, 0, 1, width/2, height/2);
		
		var xOffset = this.wAxis.x * (this.lines - 2);
		var yOffset = this.wAxis.y * (this.lines - 2);
		
		this.context.beginPath();
		this.context.moveTo(0, -yOffset);
		this.context.lineTo(xOffset, 0);
		this.context.lineTo(0, yOffset);
		this.context.lineTo(-xOffset, 0);
		this.context.clip();
		
		this.draw();
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
		this.last = e.mouse;
	},
	
	move: function(e) {
		var diff = e.mouse.sub(this.last);
		
		this.offset = this.offset.add(this.getSurfaceVector(diff));
		this.offset = new Vector(this.offset.x % this.planetSurface.width, this.offset.y % this.planetSurface.height);
		
//		console.log(x,y, this.offset, this.offsetField);
		this.draw();
		
		this.last = e.mouse;
	},
	
	endMove: function(e) {
		e.preventDefault();
	},
	
	draw: function(){
		this.context.clear();

		this.context.beginPath();
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 0.5;
		
		var offset = this.getMapVector(new Vector(this.offset.x % 1, this.offset.y % 1));
		
		var xOffset = this.wAxis.x * this.lines;
		var yOffset = this.wAxis.y * this.lines;
		for (var i = 0; i <= this.lines; i++){
			this.context.moveTo(-i * this.wAxis.x + offset.x, -yOffset + i * this.wAxis.y + offset.y);
			this.context.lineTo(xOffset  - i * this.wAxis.x + offset.x, i * this.wAxis.y + offset.y);

			this.context.moveTo(i * 10 + offset.x, -yOffset + i * 8 + offset.y);
			this.context.lineTo(-xOffset + i * 10 + offset.x, i * 8 + offset.y);
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
		
		var width = this.planetSurface.height;
		var height = this.planetSurface.height;
		
		var w = ((this.offset.x + field.w + width/2) % width) - width/2;
		var h = ((this.offset.y + field.h + height/2) % height) - height/2;

		var v = this.getMapVector(new Vector(w, h));
		
		this.context.fillStyle = 'red';
		this.context.beginPath();
		this.context.moveTo(v.x, v.y);
		this.context.lineTo(v.x + this.wAxis.x, v.y + this.wAxis.y);
		this.context.lineTo(v.x, v.y + this.wAxis.y * 2);
		this.context.lineTo(v.x + this.hAxis.x, v.y + this.hAxis.y);
		this.context.closePath();
		this.context.fill();
	}
});

window.onload = function() {
	var test = new SurfaceMap(new PlanetSurface(100, 100), document.getElementById('planets'));
};
