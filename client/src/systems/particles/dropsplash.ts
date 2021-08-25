import { GameObjects } from 'phaser';
import AnimatedParticle from './animatedparticle'

class DropSplash extends AnimatedParticle {
  constructor(emitter:GameObjects.Particles.ParticleEmitter) {
    let scene = emitter.manager.scene;
    var rainsplat = scene.anims.get('rainsplat');
    if (rainsplat === undefined) {
      // @ts-ignore
      rainsplat = scene.anims.create({
        key: 'splat',
        frames: scene.anims.generateFrameNumbers('particles', { start: 1, end: 4 }),
        frameRate: 24,
        repeat: 0
      });
    }

    super(emitter, rainsplat);
  }
}

export default DropSplash;