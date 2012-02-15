package models.events.surface

import kernel.Worker
import models.building.Building
import models.Player
import javax.persistence.EntityManager
import models.Surface
import javax.persistence.Query
import scala.collection.mutable.Buffer
import javax.persistence.TypedQuery
import scala.collection.JavaConversions

class ShuffleWorkers extends Worker {
  var player:Player 
  var surface:Surface
  var em:EntityManager
  var building:Building
  
  //all housing in a list
  def shuffleWorkers {
	  var q1:TypedQuery[Building] = em.createQuery("FROM Housing WHERE surface.player = :player ORDER BY load", classOf[Building]);
	  q1.setParameter("player", player)
	  var housings:Buffer[Building] = JavaConversions.asBuffer(q1.getResultList())
	  
  }
}