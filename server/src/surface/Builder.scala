package surface
import models.Player
import javax.persistence.EntityManager
import models.Surface
import models.Tile
import models.building.Building
import kernel.Worker

class Builder extends Worker {
  
  var player:Player 
  var surface:Surface
  var em:EntityManager
  var building:Building
  
  def build(position:Tile, typ:String){
    typ match {
      case "Housing"     => {import models.building.Housing;     building = new Housing}
      case "Constructor" => {import models.building.Constructor; building = new Constructor}
      case "Mine"        => {import models.building.Mine;        building = new Mine}
      case "Farm" 		 => {import models.building.Farm;        building = new Farm}
      case "Laboratory"  => {import models.building.Laboratory;  building = new Laboratory}
      case "Refinery"    => {import models.building.Refinery;    building = new Refinery}
      case "Spaceport"   => {import models.building.Spaceport;   building = new Spaceport}
      case "SupplyArea"  => {import models.building.SupplyArea;  building = new SupplyArea}
      case "Warehouse"   => {import models.building.Warehouse;   building = new Warehouse}
      case "Factory"     => {import models.building.Factory;     building = new Factory}
    }  
  building.position = position
  
  }
}

