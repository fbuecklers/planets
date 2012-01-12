package surface
import models.Player
import javax.persistence.EntityManager
import models.Surface
import models.Tile




class Builder /*extends Worker*/ {
  
  var player:Player 
  var surface:Surface
  var em:EntityManager
  
  def build(position:Tile, typ:String){
    typ match {
      case "Housing" => {import models.building.Housing; new Housing}
      case "HTB" => {import models.building.HTB; new HTB}
      case "Mine" => {import models.building.Mine; new Mine}
      case "Factory" => {import models.building.Factory; new Factory}
      case "Factory" => {import models.building.Factory; new Factory}
      case "Factory" => {import models.building.Factory; new Factory}
      case "Factory" => {import models.building.Factory; new Factory}
      case "Factory" => {import models.building.Factory; new Factory}
    }  
  
  }
}

