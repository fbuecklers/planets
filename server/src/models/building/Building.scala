package models.building
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import models.Surface
import models.Tile
import javax.persistence.ManyToOne

@Entity
class Building {

	@Id
	@GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
	var id: Integer = _

	@ManyToOne
	var surface: Surface = _
	var position: Tile = _

	var priority: Int = 5
	var level: Int = 1

	var energy: Int = 0
	var maxworkers: Int = 0
	var radius: Int = 0
	var workers: Int = 0
	var construction:Boolean = false

	def inRange(b: Building) = {
		
		var xRange = (this.position.x - b.position.x + surface.xLenght) % surface.xLenght 
		var yRange = (this.position.y - b.position.y + surface.yLenght) % surface.yLenght 
		
		if (xRange > surface.xLenght /2 ){
			xRange = surface.xLenght - xRange
		}
		if (yRange > surface.yLenght /2 ){
			yRange = surface.yLenght - yRange
		}	
		xRange*xRange + yRange*yRange < this.radius*this.radius
	}
}
