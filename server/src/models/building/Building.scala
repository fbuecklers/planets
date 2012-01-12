package models.building
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity
import models.Surface

@Entity
abstract class Building {
	
  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _

  var surface:Surface = _
  
  var level:Int = 1
  var energy:Int = 0
  var maxworkers:Int = 0
  var radius:Int = 0
  var workers:Int = 0
  
  def upgraide (level:Int){
    this.level = level
    this.maxworkers = 0
    this.radius = 0
    this.workerChange()
    this.energyChange()
  }
 
  def workerChange(){
      
  }
    
  def energyChange(){
    
  }
    
    
    
  
}