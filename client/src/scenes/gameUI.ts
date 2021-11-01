import { Scene } from 'phaser'
import GameState from '../state'

import Hotbar from '../ui/hotbar'
import Chatbox from '../ui/chatbox'
import Healthbar from '../ui/healthbar'

class GameUI extends Scene {

  healthbar!:Healthbar
  hotbar!:Hotbar
  chatBox!:Chatbox

  constructor() {
    super('gameui')
  }

  create() {
    // create the ui for our healthbar
    this.healthbar = new Healthbar(this)

    // create our hotbar ui
    this.hotbar = new Hotbar(this)
    this.chatBox = new Chatbox(this)
  }
}

export default GameUI