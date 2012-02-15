package models.events.surface
import javax.persistence.Entity
import javax.persistence.EntityManager
import kernel.Worker
import models.building.Building
import models.Player
import models.Surface
import models.Tile
import models.building.Farm
import models.building.Laboratory
import models.building.Spaceport
import models.building.Refinery
import models.building.Warehouse
import models.building.SupplyArea
import models.building.Housing
import models.building.Mine
import models.building.Constructor
import models.building.Factory
import events.SurfaceEvent
import models.building.Farm
import models.building.Laboratory
import models.building.Spaceport
import models.building.Refinery
import models.building.Warehouse
import models.building.SupplyArea
import models.building.Housing
import models.building.Mine
import models.building.Constructor
import models.building.Factory
import models.building.Farm
import models.building.Laboratory
import models.building.Spaceport
import models.building.Refinery
import models.building.Warehouse
import models.building.SupplyArea
import models.building.Housing
import models.building.Mine
import models.building.Constructor
import models.building.Factory
import models.building.Farm
import models.building.Laboratory
import models.building.Spaceport
import models.building.Refinery
import models.building.Warehouse
import models.building.SupplyArea
import models.building.Housing
import models.building.Mine
import models.building.Constructor
import models.building.Factory
import models.building.Farm
import models.building.Laboratory
import models.building.Spaceport
import models.building.Refinery
import models.building.Warehouse
import models.building.SupplyArea
import models.building.Housing
import models.building.Mine
import models.building.Constructor
import models.building.Factory

class Builder() extends SurfaceEvent {
  
  var building:Building
  
  
  def execute(){
    building.construction = false
    
    building match {
      case housing:Housing     => finishHousing(housing)
      case constructor:Constructor => finishConstructor(constructor)
      case mine:Mine        => finishMine(mine)
      case farm:Farm 	   => finishFarm(farm)
      case laboratory:Laboratory  => finishLaboratory(laboratory)
      case refinery:Refinery    => finishRefinery(refinery)
      case spaceport:Spaceport   => finishSpaceport(spaceport)
      case SupplyArea  => finishSupplyArea()
      case Warehouse   => finishWarehouse()
      case Factory     => finishFactory()
    }
    
    ShuffleWorkers()
  }
  
  def finishHousing(){
    
  }
  
  def finishConstructor(){
    
  }
  
  def finishMine(){
    
  }
  
  def finishFarm(){
    
  }
  
  def finishLaboratory(){
    
  }
  
  def finishRefinery(){
    
  }
  
  def finishSpaceport(){
    
  }
  
  def finishSupplyArea(){
    
  }
  
  def finishWarehouse(){
    
  }
  
  def finishFactory(){
    
  }
}

