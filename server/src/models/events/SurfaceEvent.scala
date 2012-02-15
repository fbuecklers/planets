package models.events
import models.Surface

abstract class SurfaceEvent extends Event {
	
  var surface:Surface
  
  def execute()
  
  def shuffleWorkers(){
    
  }
 
  
}