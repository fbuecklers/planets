package models
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.OneToMany
import models.events.SurfaceEvent
import scala.collection.mutable.Queue
import building.Building

@Entity
class Surface {
	
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _
  
  var time:Int = _
  var eventQueue:Queue[SurfaceEvent] = new Queue[SurfaceEvent]
  
  var planet:Planet = _
  var xLenght:Int = _
  var yLenght:Int = _
  var jobless:Int = _
  
  //Lager
  var maxstorage:Double = _
  var eisen:Int = _
  var silizium:Int = _
  var kohlenstoff:Int = _
  var arsen:Int = _
  var gallium:Int = _
  var actinoide:Int = _
  
  var food:Int = _
  var luxus:List[Luxusg] = _
  
  @OneToMany(mappedBy="building")
  var buildings:Set[Building] = _
  
  def shuffleworkers() {
    

    
    var i = 0
    var d = 0
    var freejobs = 10
    while (i <= 15 && d <= 5 && freejobs > 0){
      i += 1
    }
  }
  
}