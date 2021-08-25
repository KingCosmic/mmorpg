import { Scene } from 'phaser'
import GameState from '../state'

import Hotbar from '../ui/hotbar'
import Chatbox from '../ui/chatbox'

class GameUI extends Scene {

  hotbar!:Hotbar
  chatBox!:Chatbox

  constructor() {
    super('gameui')
  }

  create() {
    // create our hotbar ui
    this.hotbar = new Hotbar(this)
    this.chatBox = new Chatbox(this)
  }
}

export default GameUI