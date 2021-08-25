import { Scene } from 'phaser'

export default class Boot extends Scene {
  constructor() {
    super('boot')
  }

  create() {

    this.scene.start('loading')
  }
}