package util
import java.util.Calendar
import java.util.GregorianCalendar

object Time {
  val start:GregorianCalendar = {
    var c = new GregorianCalendar()
    c.set(2012, 1, 1, 0, 0, 0)
    c
  }
  
  def current:Int = toUniversal(Calendar.getInstance())
  
  def toUniversal(calendar:Calendar) = (start.compareTo(calendar) / 360).toInt
  
  def toCalendar(time:Int) = {
	 var c = start.clone().asInstanceOf[Calendar]
	 c.add(Calendar.MILLISECOND, time)
	 c
  }
  
}