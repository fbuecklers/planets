import models.Surface
import models.events.SurfaceEvent
import components.TimeComponent
import components.TimeComponent
import models.events.SurfaceEvent
import util.Time

class SurfaceExecuter {
	
	var surface:Surface = _
	
	def run() {
	  val currentTime = Time.current
	  val timer:TimeComponent = new TimeComponent(surface)
	  
	  while (surface.eventQueue.head.time < currentTime) {
	    var event:SurfaceEvent = surface.eventQueue.dequeue()
	    timer.run(event.time)
	    event.execute()
	  }
	  
	  timer.run(currentTime)
	}
  
}