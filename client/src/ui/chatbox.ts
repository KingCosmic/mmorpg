import { Scene, GameObjects } from 'phaser'
import GameState from '../state'

class Chatbox extends GameObjects.Layer {
  messages:any[] = []

  /**
   * The background image of the chatbox
   */
  backdrop!:GameObjects.Image

  /**
   * The container for all the messages, makes them easier to scroll.
   */
  chatContainer!:GameObjects.Container

  /**
   * The max amount of messages to keep stored in the log (so we don't keep infinite messages)
   */
  maxMessageCount:number = 40

  constructor(scene:Scene) {
    super(scene)

    // add this GO to the scene
    scene.add.existing(this)

    // create the hotbar
    this.createChat()

    // create our event listener
    GameState.channel.on('chat-message', this.newMessage.bind(this))
  }

  createChat() {
    // TODO: set container size to the chatbox size in the future
    this.chatContainer = this.scene.add.container(0, 0)
  }

  newMessage(msg:any) {
    this.messages.push(msg)

    console.log(`${msg.type}: ${msg.content}`)
  }
}

export default Chatbox;