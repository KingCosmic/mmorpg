import { AUTO, Types, Scale } from 'phaser'

import BootScene from './scenes/boot'
import LoadingScene from './scenes/loading'
import GameScene from './scenes/game'
import GameUI from './scenes/gameUI'

const config:Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  scale: {
    mode: Scale.RESIZE,
    autoCenter: Scale.CENTER_BOTH
  },
  parent: 'game',
  title: 'MIcro World',
  url: 'https://github.com/KingCosmic/mmorpg',
  banner: { text: 'white', background: ['#FD7400', '#FFE11A', '#BEDB39', '#1F8A70', '#004358'] },
  scene: [BootScene, LoadingScene, GameScene, GameUI]
}

export default config