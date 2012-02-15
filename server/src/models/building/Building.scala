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

  var level: Int = 1
  
  var energy: Int = 0
  var maxworkers: Int = 0
  var radius: Int = 0
  var workers: Int = 0
  var priority:Int = 5

  def inRange(b:Building){
    this.position.x  this.position.y 
  }
  	
}