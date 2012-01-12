package models
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity

@Entity
class Planet {

  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id: Integer = _

  var owner: Player = _
  var Star: Star = _
  var surface: Surface = _
}