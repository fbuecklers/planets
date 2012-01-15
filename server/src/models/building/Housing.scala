package models.building
import javax.persistence.Entity

@Entity
class Housing extends Building {

  val name: String = "Wohngebiet"
  val size: Array[Array[Int]] = Array(Array(10, 14, 12), Array(15, 20, 10), Array(14, 10, 12))

  var people = 0
  //var radius = 10
  //var energy = 500
  var maxpeople = 500
  var jobless = 0
  var jobsInRange = 0
  
  def load = people/jobsInRange
  
  def setworker(newpeople:Int):Int ={
    var number = newpeople
    if (maxpeople-people>newpeople){
      people += newpeople
      return 0
      } else {
        number -= maxpeople-people
      return number
      }
  }
}