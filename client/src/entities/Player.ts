import { GameObjects, Input } from 'phaser'
import Game from '../scenes/game'

import PL, { Body, Vec2 } from 'planck-js'

import { InputType, PlayerState } from '../types'

class Player extends GameObjects.Sprite {
  // @ts-ignore
  scene:Game

  /**
   * id of the player
   */
  id:string = '';

  /**
   * this is used to tell players apart from other objects.
   */
  category:string = 'player'

  /**
  * This is our plank body, used to stick with the normal phaser api.
  */
  // @ts-ignore
  body:Body

  /**
   * Health of the player.
   */
  health:number = 50;

  /**
   * max health of our player.
   */
  maxHealth:number = 100;

  /**
   * The speed the player moves.
   */
  speed:number = 70;

  /**
   * speed of our player when sprinting.
   */
  sprintSpeed:number = 120;

  /**
   * hotbar for our player.
   */
  hotbar:any[] = []

  /**
   * The last position of our player (used to determin what animations are played)
   */
  lastPosition:Vec2

  /**
   * The action our player is currently performing
   */
  action:boolean = false

  /**
   * the current direction our player is facing
   */
  direction:string = 'right'

  constructor(scene:Game, player:any) {
    super(scene, player.x * scene.worldScale, player.y * scene.worldScale, '')

    // the id of our player
    this.id = player.id;

    // play our animation
    this.anims.play('pw-idle')
    
    // scale our sprite to match the size of the physics body
    this.setScale(scene.worldScale)
    
    // create our physics body
    this.body = scene.world.createBody({
      position: PL.Vec2(player.x, player.y),
      type: 'dynamic'
    })
    this.body.createFixture(PL.Box(this.width / 2 / scene.worldScale, this.height / 2 / scene.worldScale),
      {
        restitution: 0,
        friction: 0
      }
    );

    // set userData to this players id
    this.body.setUserData(this.id);

    // set the default last position
    this.lastPosition = new Vec2(player.x, player.y)

    // add our player to the scene so it can render and update.
    // @ts-ignore
    scene.add.existing(this)
  }

  override preUpdate(time:number, delta:number) {
    // call the sprites built in preUpdate method
    // (this is what causes the animations to run)
    super.preUpdate(time, delta)

    // keep our sprite attached to our physics body
    this.x = this.body.getPosition().x * this.scene.worldScale
    this.y = this.body.getPosition().y * this.scene.worldScale

    // set the depth of our player based on their y
    this.setDepth(this.y)
  }

  runAnimations(b:PlayerState) {
    // grab our last position.
    let { x, y } = this.lastPosition

    // calculate the difference between it and our current position.
    let difX = x - b.x
    let difY = y - b.y

    // default animation
    let anim = 'idle'

    // if we have a difference in the x axis change our direction and animation.
    if (difX < 0) {
      anim = 'wr'
      this.direction = 'right'
    } else if (difX > 0) {
      anim = 'wl'
      this.direction = 'left'
    }

    // If we have a difference in the y axis change our direction and animation.
    if (difY < 0 && anim === 'idle') {
      anim = 'wd'
      this.direction = 'down'
    } else if (difY > 0 && anim === 'idle') {
      anim = 'wu'
      this.direction = 'up'
    }

    if (b.action && anim === 'idle') {
      anim = `m-${this.direction}`
    }

    // play our current animation
    this.anims.play(`pw-${anim}`, true)

    // set our last position
    this.lastPosition.set(b.x, b.y)
  }

  /** 
   * apply user's input to this entity.
   */
  applyInput(input:InputType) {
    // create a ne velocity vector
    let vel = PL.Vec2()

    // are we sprinting or not?
    const speed = (input.s) ? this.sprintSpeed : this.speed

    // for the x axis multiply the horizontal input by our speed.
    vel.x = input.h * speed

    // for the y axis multiply the vertical input by our speed.
    vel.y = input.v * speed

    // apply the velocity to our bodys world center.
    this.body.applyLinearImpulse(vel, this.body.getWorldCenter(), true)
  }
}

export default Player;