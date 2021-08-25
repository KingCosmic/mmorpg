import { Geom, Scene, GameObjects } from 'phaser'
import DropSplash from './particles/dropsplash'

class WeatherSystem {
  particles:GameObjects.Particles.ParticleEmitterManager
  splashEmitter:GameObjects.Particles.ParticleEmitter
  screenRect:Geom.Rectangle
  scene:Scene

  constructor(scene:Scene) {
    this.scene = scene

    // create our particle manager
    this.particles = scene.add.particles('particles');

    // our screen rect for emitting particles
    this.screenRect = new Geom.Rectangle(0, 0, scene.cameras.main.width + 128, scene.cameras.main.height + 128);

    // the splash emitter for our rain splash
    this.splashEmitter = this.particles.createEmitter({
      x: 0, y: 0,
      speed: 0,
      lifespan: 600,
      quantity: 5,
      frequency: 10,
      alpha: { start: 0.2, end: 0.0 },
      scaleX: { start: 1.5, end: 2.5 },
      scaleY: { start: .8, end: 1.1 },
      on: true, // im retarded
      // @ts-ignore
      emitZone: { type: 'random', source: this.screenRect },
      // @ts-ignore
      particleClass: DropSplash,
      blendMode: 'ADD',
    });


    let stepEmitter = this.particles.createEmitter({
      frame: 2,
      x: 0, y: 0,
      speed: 0,
      lifespan: 800,
      quantity: 1,
      alpha: { start: 0.5, end: 0.0 },
      scale: { start: 1, end: 2 },
      on: false,
      // @ts-ignore
      particleClass: DropSplash,
      blendMode: 'ADD',
    });

    let shadows = scene.add.tileSprite(0, 0, scene.cameras.main.width, scene.cameras.main.height, 'cloudmask')
    shadows.setAlpha(.3);

    let clouds = scene.make.shader({
      key: 'Perlin',
      x: scene.sys.canvas.width / 2,
      y: scene.sys.canvas.height / 2,
      width: scene.sys.canvas.width,
      height: scene.sys.canvas.height,
      add: false
    });

    // how dense we want the clouds to be (0 - 1)
    clouds.setUniform('density.value', .3);
    clouds.setScrollFactor(0);

    // and we mask our cloud shader with the right color tilesprite
    shadows.setMask(clouds.createBitmapMask())

    // store the cameras prerender function so we can reapply it
    // before we do our custom logic.
    // @ts-ignore
    let _preRender = scene.cameras.main.__proto__.preRender;
    // @ts-ignore
    scene.cameras.main.preRender = (resolution) => {
      // run the camera's default preRender function
      _preRender.apply(scene.cameras.main, [resolution]);

      // get the midpoint of the camera view
      const { x, y } = scene.cameras.main.midPoint;

      // set the shadows position (since it's origin is .5 the midpoint is what we want)
      shadows.setPosition(x, y)
      // this makes sure the clouds keep still.
      clouds.uniforms.scroll.value = { x, y: -y };
      // and zoom with our camera
      clouds.uniforms.zoom.value = scene.cameras.main.zoom;
      // this makes our clouds scale with the camera zoom
      clouds.scale = 1 / scene.cameras.main.zoom;
    }

  }
  getBackground() {
    return this.particles;
  }
  getForeground() {
    return null;
  }
  getClouds() {
    return null;
  }
  setPosition(x:number, y:number) {
    this.splashEmitter.setPosition(x, y);
  }
}

export default WeatherSystem;