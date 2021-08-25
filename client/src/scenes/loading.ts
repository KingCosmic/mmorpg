import { Scene } from 'phaser'

class Loading extends Scene {
  constructor() {
    super({
      key: 'loading'
    })
  }

  preload() {
    var progressBar = this.add.graphics()
    var progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(240, 270, 320, 50)

    var width = this.cameras.main.width
    var height = this.cameras.main.height
    var loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    var percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace'
      }
    });
    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value:any) => {
      console.log(value);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
      percentText.setText((value * 100) + '%');
    });

    this.load.on('fileprogress', (file:any) => {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', () => {
      console.log('complete');
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.spritesheet('player-white', '/assets/entities/character-white.png', { frameWidth: 32, frameHeight: 32 })

    this.load.image('menucontainer', '/assets/ui/menucontainer.png')
    this.load.spritesheet('items', '/assets/ui/item-icons.png', { frameWidth: 32, frameHeight: 32 })

    this.load.image('cloudmask', '/assets/cloudmask.png');

    this.load.spritesheet('particles', '/assets/particle.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('tiles', '/assets/tiles/tilemap.png', { frameWidth: 32, frameHeight: 32 });

    this.load.glsl('perlin', '/assets/shaders/perlin.glsl');
  }

  create() {
    this.anims.create({ key: 'pw-wd', frames: this.anims.generateFrameNames('player-white', { start: 0, end: 7 }), repeat: -1, frameRate: 13 })
    this.anims.create({ key: 'pw-wu', frames: this.anims.generateFrameNames('player-white', { start: 8, end: 15 }), repeat: -1, frameRate: 13 })
    this.anims.create({ key: 'pw-wr', frames: this.anims.generateFrameNames('player-white', { start: 16, end: 23 }), repeat: -1, frameRate: 13 })
    this.anims.create({ key: 'pw-wl', frames: this.anims.generateFrameNames('player-white', { start: 24, end: 31 }), repeat: -1, frameRate: 13 })
    this.anims.create({ key: 'pw-idle', frames: this.anims.generateFrameNames('player-white', { start: 0, end: 0 }), frameRate: 0 })

    this.anims.create({ key: 'pw-m-down', frames: this.anims.generateFrameNames('player-white', { start: 144, end: 148 }), frameRate: 13 })
    this.anims.create({ key: 'pw-m-up', frames: this.anims.generateFrameNames('player-white', { start: 152, end: 156 }), frameRate: 13 })
    this.anims.create({ key: 'pw-m-right', frames: this.anims.generateFrameNames('player-white', { start: 160, end: 164 }), frameRate: 13 })
    this.anims.create({ key: 'pw-m-left', frames: this.anims.generateFrameNames('player-white', { start: 168, end: 172 }), frameRate: 13 })

    this.scene.start('game')
  }
}

export default Loading;