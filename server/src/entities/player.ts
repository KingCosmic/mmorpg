import Entity from './base'
import PL from 'planck-js'
import { uuid } from 'uuidv4'

class Player extends Entity {

  /**
   * Items our player has.
   */
  items:any[]

  /**
   * Items our player has in their hotbar
   */
  hotbar:any[]

  /**
   * The currently equipped item, 0 based like our array
   */
  equippedItem:number = 0

  /**
   * is our character currently performing a action?
   */
   action:boolean = false

  constructor(id:string, world:PL.World) {
    super('player')

    this.hp = 100;
    this.speed = 70;
    this.items = [
      {
        id: uuid(),
        texture: 'shp', // items texture name
        name: 'Health Potion', // items name
        consumable: { // object containing the properties and their amounts.
          hp: 10
        },
        stacks: 10 // stacks up the amount specified (0 or undefined for non stackable)
      }
    ]

    // TODO: get hotbar working with mining animations.
    this.hotbar = [
      {
        id: uuid(),
        texture: 'pickaxe',
        name: 'Pickaxe'
      }
    ]

    this.id = id;
    this.name = `player-${id}`

    this.width = 16;
    this.height = 16;

    this.body = world.createBody({
      position: PL.Vec2(200, 200),
      type: 'dynamic'
    })
    this.body.createFixture(PL.Box(this.width / 2 / 2, this.height / 2 / 2),
    {
      restitution: 0,
      friction: 0
    });

    this.body.setUserData(id);
  }

  // apply user's input to this entity.
  applyInput(input:{ h:number, v:number, action:boolean }) {
    let vel = PL.Vec2()

    vel.x = input.h * this.speed;
    vel.y = input.v * this.speed;

    this.body.applyLinearImpulse(vel, this.body.getWorldCenter(), true)

    this.action = input.action

    this.wasUpdated = true;
  }

  getUpdate() {
    let pos = this.body.getPosition();

    return {
      id: this.id,
      category: this.category,
      x: pos.x,
      y: pos.y,
      items: this.items,
      hotbar: this.hotbar,
      action: this.action
    }
  }
}

export default Player