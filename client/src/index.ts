import Phaser from 'phaser'
import config from './config'

export class MMORPG extends Phaser.Game {
  constructor() {
    super(config);
  }
}

new MMORPG()
