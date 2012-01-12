import models.Test
import javax.persistence.EntityManagerFactory
import javax.persistence.EntityManager
import javax.persistence.PersistenceUnit
import javax.persistence.Persistence
import javax.naming.InitialContext
import models.Player

object Main {

  def main(args: Array[String]): Unit = {
    
    var test:Test = new Test()
    test.str = "muh"
      
    var player = new Player();
    player.name = "Malte"
    
    var factory:EntityManagerFactory = Persistence.createEntityManagerFactory("server")
  	var em:EntityManager = factory.createEntityManager()
    
  	em.getTransaction().begin()
  	em.persist(test)
  	em.persist(player)
  	em.getTransaction().commit()
  	
  	em.getTransaction().begin()
  	var test2 = em.find(classOf[Test], 1)
  	em.getTransaction().commit()
  	
  	println(test2.str);
  	
  	em.close()
    
  }

}