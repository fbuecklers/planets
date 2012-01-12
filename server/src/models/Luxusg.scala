package models
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Entity

@Entity
class Luxusg {

  @Id
  @GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)
  var id:Integer = _

  var name:String =  _
  var kost:Array[Int] = _
  var bonus:Int = _
  
}