import Phaser from 'phaser'

import BootScene from './scenes/boot'
import LoadingScene from './scenes/loading'
import GameScene from './scenes/game'
import GameUI from './scenes/gameUI'

export default {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  title: 'Phaser 3 mmorpg',
  url: 'https://github.com/KingCosmic/mmorpg',
  banner: { text: 'white', background: ['#FD7400', '#FFE11A', '#BEDB39', '#1F8A70', '#004358'] },
  scene: [BootScene, LoadingScene, GameScene, GameUI]
}