package models
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import models.building.Building

@Entity
class Tile {
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _

  var surface:Surface = _
  var building:Building = _

}