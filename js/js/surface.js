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

var SurfaceMap = ElementComponent.inherit({
	initialize: function(planetSurface){
		this.superCall(document.getElementById('surface'));
		
		this.planetSurface = planetSurface;
		this.context = this.element.getContext('2d');
		
		this.offset = new Vector(0, 0);
		
		this.wAxis = new Vector(10, 8);
		this.hAxis = new Vector(-10, 8);
		
		for (var i = 0, field; field = this.planetSurface.fields[i]; ++i) {
			this.addComponent(new SurfaceMapField(field));
		}
		
		this.addListener('over', this.onOver);
		this.addListener('click', this.onClick);
		this.addListener('move', this.onMove);
	},
	
	getComponent: function(mouse) {
		var center = new Vector(this.element.width/2, this.element.height/2);
		var v = this.getSurfaceVector(mouse.sub(center)).sub(this.offset);
		
		var w = Math.floor(v.x + 2*this.planetSurface.width) % this.planetSurface.width;
		var h = Math.floor(v.y + 2*this.planetSurface.height) % this.planetSurface.height;
		
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
	
	resize: function(width, height) {
		this.element.width = width; 
		this.element.height = height;
		
		var wLines = Math.floor(width / (this.wAxis.x * 2));
		var hLines = Math.floor(height / (this.wAxis.y * 2));
		
		this.lines = wLines > hLines? wLines: hLines;
		this.lines += 2 + this.lines % 2;
		
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
	
	onOver: function(e) {
		if (e.target != this) {			
			this.draw();
			this.drawField(e.target.field);
		}
	},
	
	onClick: function(e) {
		console.log(e.target.field.w, e.target.field.h, e.target.field.index);
	},
	
	onMove: function(e) {
		this.offset = this.offset.add(this.getSurfaceVector(e.mouseDelta));
		this.offset = new Vector(this.offset.x % this.planetSurface.width, this.offset.y % this.planetSurface.height);
		
		this.draw();
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
	},
	
	drawField: function(field) {
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

var Slider = ElementComponent.inherit({
	initialize: function(element) {
		this.superCall(element);
		
		this.template = element.removeChild(element.querySelector('div'));
		this.scrollOffset = 0;

		this.bar = new SliderBar(this);
		ElementComponent.prototype.addComponent.call(this, this.bar);
		element.appendChild(this.bar.element);
		
		this.content = document.createElement('div');
		this.content.className = 'content';
		element.appendChild(this.content);
		
		this.hideBar = Interval.create(100, this.onHideBar);
		
		this.addListener('wheel', this.onWheel);
		this.addListener('move', this.onMove);
	},
	
	addComponent: function(component) {
		if (!component.element) {
			var childNode = this.template.cloneNode(true);
			component.element = childNode;
			childNode.component = component;
		}
		
		this.content.appendChild(component.element);
		this.superCall(component);
	},
	
	removeComponent: function(component) {
		this.superCall(component);		
		this.content.removeChild(component.element);
	},
	
	resize: function(width, height) {
		this.element.style.width = width + 'px';
		this.element.style.height = height + 'px';

		this.heightFactor = (this.element.clientHeight - 4) / this.content.clientHeight;
		
		this.scroll(0);
	},
	
	scroll: function(delta) {
		this.scrollOffset += delta;
		
		var dist = this.content.clientHeight - this.element.clientHeight;
		
		if (this.scrollOffset > dist)
			this.scrollOffset = dist;
		
		if (this.scrollOffset < 0)
			this.scrollOffset = 0;
		
		this.content.style.top = (-this.scrollOffset) + 'px';
		
		if (this.heightFactor < 1) {
			this.bar.element.style.opacity = 1;
			this.bar.element.style.display = 'block';
			this.bar.element.style.height = (this.heightFactor * (this.element.clientHeight - 4)) + 'px';
			this.bar.element.style.top = (2 + this.scrollOffset * this.heightFactor) + 'px';
		} else {
			this.bar.element.style.display = 'none';
		}
		
		this.hideBar.start(20);
	},
	
	onHideBar: function(e) {
		this.bar.element.style.opacity = 2 - e.remaining * .2;
	},
	
	onWheel: function(e) {
		this.scroll(-e.mouseDelta * 10);
	},
	
	onMove: function(e) {
		this.scroll(e.mouseDelta.y);
	}
});

var SliderBar = ElementComponent.inherit({
	initialize: function(slider) {
		this.superCall(document.createElement('div'));
		this.element.className = 'bar';
		
		this.slider = slider;
		
		this.addListener('move', this.onMove);
	},
	
	onMove: function(e) {
		this.slider.scroll(e.mouseDelta.y / this.slider.heightFactor);
	}
});

var BuildingType = ElementComponent.inherit({
	initialize: function(cls) {
		this.superCall();
		
		this.cls = cls;
		
		this.addListener('active', this.onActive);
		this.addListener('inactive', this.onInactive);
	},
	
	init: function(component) {
		this.superCall(component);

		var context = this.element.querySelector('canvas').getContext('2d');
		size = this.cls.prototype.size;
	},
	
	onActive: function(e) {
		this.element.className = 'building active';
	},
	
	onInactive: function(e) {
		this.element.className = 'building';
	}
});

var Surface = DocumentComponent.inherit({
	
	initialize: function() {
		this.superCall();
		
		this.map = new SurfaceMap(new PlanetSurface(100, 100));
		this.buildings = new Slider(document.getElementById('buildings'));
		
		this.addComponent(this.map);
		this.addComponent(this.buildings);
		
		for (var className in buildings) {
			this.buildings.addComponent(new BuildingType(buildings[className]));
		}
		
		this.addListener('resize', this.onResize);
		this.onResize();
	},
	
	onResize: function(e) {
		this.map.resize(e.width - 208, e.heigth - 8);
		this.buildings.resize(200, e.height);
	}
	
});

window.onload = function() {
	surface = new Surface();
};
