import { Events } from 'phaser'
import geckos, { ClientChannel } from '@geckos.io/client'

class State {
  static channel:ClientChannel

  /**
   * our event emitter
   */
  static events:Events.EventEmitter = new Events.EventEmitter()

  /**
   * Items our player has.
   */
  static items:any[] = []

  /**
   * Items our player has in their hotbar
   */
  static hotbar:any[] = []

  /**
   * The currently equipped item, 0 based like our array
   */
  static equippedItem:number = 0

  /**
   * connect
   */
  public static connect() {
    this.channel = geckos({
      url: `http://localhost`,
      port: 3000
    })
  }
}

export default State