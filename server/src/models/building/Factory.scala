package models.building
import javax.persistence.Entity

@Entity
class Factory extends Building {

  var name:String = "Fabrik"
	var size:Array[Array[Int]] = Array(Array(8,4,10,9),Array(15,10,12,7),Array(14,10,6,15))

		var maxworkers = 200;
		var radius = 10;
		var currentworkers = 0;
		var energy = 20;
		var production = 5;
}