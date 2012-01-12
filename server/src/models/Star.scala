package models
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity


@Entity
class Star {
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _
  
	var position:Star = _
}