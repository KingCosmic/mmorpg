import { Scene, GameObjects } from 'phaser'
import GameState from '../state'

class Hotbar extends GameObjects.Layer {
  /**
   * The amount of hotbar slots we have.
   */
  hotbarSlots:number = 7;

  /**
   * The size of our hotbar slots in pixels
   */
  hotbarSize:number = 64;

  constructor(scene:Scene) {
    super(scene)

    // add this GO to the scene
    scene.add.existing(this)
    
    // create the hotbar
    this.createHotbar()

    // update our healthbar when an event occurs
    GameState.events.on('update-hotbar', this.updateHotbar, this)
  }

  createHotbar() {
    // the bottom of the screen
    const bottom = this.scene.cameras.main.height;
    
    // the total size of our hotbar (slot amount multiplied by size)
    const total = this.hotbarSlots * this.hotbarSize

    // difference between total size and screen size divided by two
    const padding = (this.scene.cameras.main.width - total) / 2

    for (let s = 0; s < this.hotbarSlots; s++) {
      const slot = this.scene.add.image(0, 0, 'menucontainer')
      this.add(slot)

      const y = bottom - (this.hotbarSize + 5)
      const x = padding + (s * this.hotbarSize)

      // set our position and origin
      slot.setPosition(x, y).setOrigin(0)
    }
  }

  updateHotbar() {
    // the bottom of the screen
    const bottom = this.scene.cameras.main.height;
    
    // the total size of our hotbar (slot amount multiplied by size)
    const total = this.hotbarSlots * this.hotbarSize

    // difference between total size and screen size divided by two
    const padding = (this.scene.cameras.main.width - total) / 2

    // loop through hotbor slots and update them.
    for (let s = 0; s < this.hotbarSlots; s++) {
      // grab item related to this hotbar slot.
      const item = GameState.player.hotbar[s]

      // grab gameobject by name.
      let icon = this.getByName(`${s}`)

      // calculate y position
      const y = bottom - (this.hotbarSize + 5)

      // calculate x position
      const x = padding + (s * this.hotbarSize)

      // no item and no icon? just continue
      if (!icon && !item) continue

      // a icon but no item? just detroy it
      if (icon && !item) icon.destroy()

      // no icon but a item? just make one
      if (!icon && item) icon = this.scene.add.image(x, y, 'items', 162).setOrigin(0).setScale(2)

      // this check is for typescript
      if (!icon) return

      // update name to the item name.
      icon.name = `${s}`

      // add icon to our scene if needed.
      this.add(icon)
    }
  }
}

export default Hotbar