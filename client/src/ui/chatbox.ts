import { Scene, GameObjects } from 'phaser'
import GameState from '../state'

import TextInput from './components/textinput'

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

  /**
   * The text input we get our chat input from.
   */
  chatInput!:TextInput

  constructor(scene:Scene) {
    super(scene)

    // add this GO to the scene
    scene.add.existing(this)

    // create the hotbar
    this.createChat()

    // setup our event listeners after we've created our chat.
    this.setupListeners()
  }

  createChat() {
    const cam = this.scene.cameras.main

    // TODO: set container size to the chatbox size in the future
    this.chatContainer = this.scene.add.container(0, 0)

    // create our chat input so we can type messages and such.
    this.chatInput = new TextInput(this.scene, 'font', {
      x: 150 + 20,
      y: cam.height - 32 - 10,
      align: 1,
      width: 300,
      size: 64,
      text: 'lay',
      padding: 8,
      maxlength: 8,
      backgroundColor: 0x000000,
      backgroundAlpha: 0.4
    })
  }

  setupListeners() {
    // our event listener for sending messages
    this.chatInput.on('submit', GameState.sendMessage)

    // setup our event listener for new messages recieved.
    GameState.channel.on('chat-message', this.newMessage.bind(this))
  }

  newMessage(msg:any) {
    // push the message to our messages array.
    this.messages.push(msg)

    // this should keep us below max message count. (we should only ever be 1 message over when this check runs.)
    if (this.messages.length > this.maxMessageCount) this.messages.shift()

    // for rn let's just log our message.
    console.log(`${msg.type}: ${msg.content}`)
  }
}

export default Chatbox;