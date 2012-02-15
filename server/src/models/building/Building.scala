package models.building
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import models.Surface
import models.Tile

@Entity
class Building {

  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id: Integer = _

  var surface: Surface = _
  var position: Tile = _
  
  var priority:Int = 5
  var level: Int = 1
  var energy: Int = 0
  var maxworkers: Int = 0
  var radius: Int = 0
  var workers: Int = 0
  var construction = false
}