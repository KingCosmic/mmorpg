import { Scene, GameObjects } from 'phaser'
import GameState from '../state'


class Healthbar extends GameObjects.Layer {
  g:GameObjects.Graphics

  healthBarHeight:number = 16

  constructor(scene:Scene) {
    super(scene)

    // add this GO to the scene
    scene.add.existing(this)

    this.g = scene.add.graphics();

    GameState.events.on('update-health', this.updateHealthbar, this)
  }

  updateHealthbar() {
    // clear all currently drawn graphics.
    this.g.clear();

    // the bottom of the screen
    const bottom = this.scene.cameras.main.height;
  
    // the total size of our hotbar (slot amount multiplied by size)
    const total = 7 * 64

    // difference between total size and screen size divided by two
    const padding = (this.scene.cameras.main.width - total) / 2
 
    // y = screen size - hotbar height + healthbar height + exp bar height + padding
    const y = bottom - (69 + this.healthBarHeight + 14 + 10)

    // draw the bar outline
    this.g.fillRect(padding, y, total, this.healthBarHeight);

    // change the color of our graphics
    this.g.fillStyle(0xff0000)

    // determin the width of our healthbar.
    const healthWidth = (GameState.player.health / GameState.player.maxHealth) * total

    // draw health
    this.g.fillRect(padding + 2, y + 2, healthWidth, this.healthBarHeight - 4)
  }
}

export default Healthbar