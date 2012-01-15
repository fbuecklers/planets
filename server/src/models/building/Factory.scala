package models.building
import javax.persistence.Entity

@Entity
class Factory extends Building {

  val name: String = "Fabrik"
  val size: Array[Array[Int]] = Array(Array(8, 4, 10, 9), Array(15, 10, 12, 7), Array(14, 10, 6, 15))


}