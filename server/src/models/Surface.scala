package models
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import models.building.Building

@Entity
class Surface {
	
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _

  var planet:Planet = _
  
  
  //Lager
  var maxstorage:Double = _
  var eisen:Int = _
  var silizium:Int = _
  var kohlenstoff:Int = _
  var arsen:Int = _
  var gallium:Int = _
  var actinoide:Int
  
  var food:Int = _
  var luxus:List[Luxusg] = _
  
  
 def getStorage() {
    
  }
  
 def 
}