import { GameObjects, Animations } from 'phaser'

class AnimatedParticle extends GameObjects.Particles.Particle {
  anim:Animations.Animation
  t:number = 0
  i:number = 0

  constructor(emitter:GameObjects.Particles.ParticleEmitter, anim:Animations.Animation) {
    super(emitter);

    this.anim = anim;
  }

  update(delta:number, step:number, processors:any[]) {
    var result = super.update(delta, step, processors);

    this.t += delta;

    if (this.t >= this.life / this.anim.frames.length) {
      this.i++;

      if (this.i > this.anim.frames.length - 1) {
        this.i = 0;
        if (this.anim.repeat != -1) {
          return true;
        }
      }
      this.frame = this.anim.frames[this.i].frame;

      this.t -= this.life / this.anim.frames.length;
    }

    return result;
  }
}

export default AnimatedParticle;