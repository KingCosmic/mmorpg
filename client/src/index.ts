import Phaser from 'phaser'
import config from './config'

export class YourGameName extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

const game = new YourGameName(config);
