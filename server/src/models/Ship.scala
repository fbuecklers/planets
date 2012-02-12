package models
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity


@Entity
class Ship {
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _
  
  var fleet:Fleet = _
  
}