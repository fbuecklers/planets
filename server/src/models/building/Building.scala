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
  var id:Integer = _

  var surface:Surface = _
  var position:Tile = _
  
  var level:Int = 1
  var energy:Int = 0
  var maxworkers:Int = 0
  var radius:Int = 0
  var workers:Int = 0
  var housingInRange:List[Housing] = _
  
  def upgraide2 (level:Int){
    this.level = level
    this.maxworkers = 0
    this.radius = 0
    
    this.workerChange()
  }
 
  def workerChange(){
    var people = maxworkers-workers
    
    if (this.surface.jobless >=  people){
      if (housingInRange.view.map(_.jobless).sum >= people){
    	this.surface.jobless -= people  
        housingInRange.foreach(e => people = e.setworker(people))
      } else {
    	  surface.shuffleworkers()        
      }
    } else {
      surface.shuffleworkers()        
    }
   this.energyChange()
  }
  
  def energyChange(){
    
  }
    
    
    
  
}