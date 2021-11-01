import Entity from './base'
import PL from 'planck-js'
import { uuid } from 'uuidv4'
import { InputType } from '../types'


/**
 * The entity object that represents our players.
 */
class Player extends Entity {

  /**
   * Health of the player
   */
  health:number = 50;

  /**
   * max health of our player.
   */
  maxHealth:number = 100;

  /**
   * Stamina of the player.
   */
  stamina:number = 20;

  /**
   * Max Stamina of the player.
   */
  maxStamina:number = 100;

  /**
   * Speed of the player.
   */
  speed:number = 70;

  /**
   * speed of our player when sprinting.
   */
  sprintSpeed:number = 120;

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
  
  /**
   * the id of the last processed input for this player.
   */
  lastProcessedInput:number = 0

  constructor(id:string, world:PL.World) {
    super('player')

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
    // currently space bar just does the mine animation
    this.hotbar = [
      {
        id: uuid(),
        texture: 'pickaxe',
        name: 'Pickaxe'
      }
    ]

    // set the id of our player
    this.id = id;

    // set the name of this player.
    this.name = `player-${id}`

    // our players size (in pixels)
    this.width = 16;
    this.height = 16;

    // create a physics body for our player
    this.body = world.createBody({
      position: PL.Vec2(200, 200),
      type: 'dynamic'
    })
    this.body.createFixture(PL.Box(this.width / 2 / 2, this.height / 2 / 2),
    {
      restitution: 0,
      friction: 0
    });

    // set the body's user data to the player id.
    this.body.setUserData(id);
  }

  // apply user's input to this entity.
  applyInput(input:InputType) {
    // create a vec2 for our velocity.
    let vel = PL.Vec2()

    // are we sprinting or not?
    const speed = (input.s) ? this.sprintSpeed : this.speed

    // multiply our horizontal input by our speed.
    vel.x = input.h * speed

    // multiply our veritcal input by our speed.
    vel.y = input.v * speed

    // apply the velocity to our player
    this.body.applyLinearImpulse(vel, this.body.getWorldCenter(), true)

    // set if we're performing a action or not.
    this.action = input.action

    // update the id of the last processed input.
    this.lastProcessedInput = input.isn

    // and update our wasUpdated flag.
    this.wasUpdated = true;
  }

  /**
   * returns a object version of our player for world updates.
   */
  getUpdate() {
    // grab our position for ease of access.
    let pos = this.body.getPosition();

    // return our player in mostly object form.
    return {
      id: this.id,
      category: this.category,
      x: pos.x,
      y: pos.y,
      items: this.items,
      hotbar: this.hotbar,
      action: this.action,
      isn: this.lastProcessedInput
    }
  }
}

export default Player