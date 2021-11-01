import { Body } from 'planck-js'

/**
 * The base class for all Entities in the world (enemies, animals, pets, etc.)
 */
class Entity {
  // a string to give a easy way to check entity types
  category:string = 'base'

  // id of our entity (for world updates and such)
  id:string = ''

  // the name of our Entity.
  name:string = ''

  // physics body of our Entity
  body!:Body

  /**
   * Health of the Entity
   */
  health:number = 50;

   /**
    * max health of our Entity.
    */
  maxHealth:number = 100;

  /**
   * Stamina of the Entity.
   */
  stamina:number = 20;

  /**
   * Max Stamina of the Entity.
   */
  maxStamina:number = 100;

  // some stats all entities have.
  speed:number = 0
  sprintSpeed:number = 10;
  width:number = 0
  height:number = 0

  // flag to know when we need to update clients of this object.
  wasUpdated:boolean = true;

  /**
   * all we require when extending is a new category
   * @param category the category of this new Entity
   */
  constructor(category:string) {
    this.category = category;
  }

  /**
   * returns a object to show this entities current state
   */
  getUpdate() {
    return {};
  }
}

export default Entity