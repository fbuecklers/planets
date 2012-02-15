package surface

import kernel.Worker
import models.building.Building
import models.Player
import javax.persistence.EntityManager
import models.Surface
import javax.persistence.Query
import scala.collection.mutable.Buffer
import javax.persistence.TypedQuery
import scala.collection.JavaConversions
import building.Building
import building.Housing

class ReallocateWorkers(surface:Surface) extends Worker {
  
  val absValue = 30
  
  def run() {
    var housing:Set[Housing] = surface.buildings.filter(_.isInstanceOf[Housing])
    
	  for (b:Building <- surface.buildings) {
	    if (b.workers > 0)
	      
	  }
  }
  
  class Vertex(var edges:Array[Edge]) {
    
  }
  
  class Edge(val from:Vertex, val to:Vertex, val weight:Int, val inverse:Boolean) {
    var inverseEdge:Edge
    
    def this(from:Vertex, to:Vertex, weight:Int) {
    	this(from, to, weight, false)
    	inverseEdge = new Edge(this)
    }
    
    def this(e:Edge) {
      this(e.to, e.from, 0, true)
      inverseEdge = e
    }
  }
  
    //var q1:TypedQuery[Building] = em.createQuery("FROM Housing WHERE surface.player = :player ORDER BY load", classOf[Building]);
	//  q1.setParameter("player", player)
	//  var housings:Buffer[Building] = JavaConversions.asBuffer(q1.getResultList())
}