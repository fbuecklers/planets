import models.Test
import javax.persistence.EntityManagerFactory
import javax.persistence.EntityManager
import javax.persistence.PersistenceUnit
import javax.persistence.Persistence
import javax.naming.InitialContext

object Main {

  def main(args: Array[String]): Unit = {
    
    var test:Test = new Test()
    test.str = "test"
    
    var factory:EntityManagerFactory = Persistence.createEntityManagerFactory("server")
  	var em:EntityManager = factory.createEntityManager()
    
  	em.getTransaction().begin()
  	em.persist(test)
  	em.getTransaction().commit()
  	
  	em.close()
    
  }

}