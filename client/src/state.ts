import { Events } from 'phaser'
import geckos, { ClientChannel } from '@geckos.io/client'
import Player from 'entities/Player'

class State {
  static channel:ClientChannel

  /**
   * our event emitter
   */
  static events:Events.EventEmitter = new Events.EventEmitter()

  /**
   * Our player
   */
  static player:Player;

  /**
   * connect
   */
  public static connect() {
    this.channel = geckos({
      url: `http://localhost`,
      port: 3000
    })
  }

  public static sendMessage(content:string) {
    this.channel.emit('chat-message', content)
  }
}

export default State