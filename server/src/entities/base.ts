import { Body } from 'planck-js'

class Entity {
  category:string = 'base'

  // id and name of our entity
  id:string = ''
  name:string = ''

  // physics body of our entity
  body!:Body

  // some stats all entities have.
  hp:number = 0
  speed:number = 0
  width:number = 0
  height:number = 0

  // flag to know when we need to update clients of this object.
  wasUpdated:boolean = true;

  constructor(category:string) {
    this.category = category;
  }

  getUpdate() {
    return {};
  }
}

export default Entity