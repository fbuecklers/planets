package models.building
import javax.persistence.Entity

@Entity
class Housing extends Building {

	val name:String = "Wohngebiet"
	val size:Array[Array[Int]] = Array(Array(10,14,12),Array(15,20,10),Array(14,10,12))
	
	var people = 0
	var radius = 10
	var energy = 500
	var maxpeople = 500
}