package models

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Table
import scala.reflect.BeanProperty

@Entity
@Table(name = "projects")
class Test() {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  var id: Integer = _

  var str: String = "test"

  //def this() = this(0)
}