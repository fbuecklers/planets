package models
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity

@Entity
class Player {
  
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _
  
  var name:String = _
  
}