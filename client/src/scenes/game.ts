import { Scene, Input } from 'phaser'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { Entity } from '@geckos.io/snapshot-interpolation/lib/types'

import Player from '../entities/Player'

import PL, { Vec2, World } from 'planck-js'
import WeatherSystem from '../systems/weather'
import State from '../state'
import Terrain from '../systems/terrain'

export default class Game extends Scene {
  SI:SnapshotInterpolation = new SnapshotInterpolation(30)

  worldScale:number = 2
  gravity:Vec2 = Vec2(0, 0)
  world!:World

  weather!:WeatherSystem

  players:Map<String, Player> = new Map()
  pets:Map<String, any> = new Map()
  items:Map<String, any> = new Map()

  inputs!: {
    up:Input.Keyboard.Key
    down:Input.Keyboard.Key
    left:Input.Keyboard.Key
    right:Input.Keyboard.Key
    space:Input.Keyboard.Key
  }
  
  constructor() {
    super('game')
  }

  create() {
    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 1 pixels = 1 meter.
    this.worldScale = 2;

    // world gravity, as a Vec2 object. It's just a x, y vector
    const gravity = PL.Vec2(0, 0);

    // this is how we create a Box2D world
    this.world = PL.World(gravity);

    // setup our socket channels
    State.connect();
    State.channel.onConnect(this.startServerListeners.bind(this))

    // and our input keys (there is a easier way then this I believe)
    this.inputs = {
      up: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE)
    }

    // zoom our camera now because a lot of our size logic
    // uses the camera state (we zoom instead of scaling assets
    // because blitters (our tilemap render cant be scaled))
    this.cameras.main.setZoom(2);

    // our terrain system.
    new Terrain(this, 0, 0).renderTerrain()

    // our custom rain particles and cloud shadows
    this.weather = new WeatherSystem(this)

    // start our ui
    this.scene.run('gameui')
  }

  startServerListeners(error:any) {
    if (error) console.error(error.message)

    State.channel.on('player-data', (player:any) => {
      this.createPlayer(player)
      console.log(player)
      State.hotbar = player.hotbar
      State.events.emit('update-hotbar')
    })

    State.channel.on('update', (snapshot:any) => {
      this.SI.snapshot.add(snapshot)
    });
  }

  update() {
    // Not connected yet.
    if (State.channel.id === undefined)
      return;

    // process input
    this.processInputs();

    // update our players.
    this.updatePlayers()

    // this sets the position of the weather emitter to stay in camera so we get nice rain :D
    this.weather.setPosition(this.cameras.main.worldView.x - 64, this.cameras.main.worldView.y - 64);
  }

  /**
   * Get our inputs and sends them to the server
   * aswell as do client-side prediction.
   */
  processInputs() {
    // grab our player for future use.
    const player = this.players.get(State.channel.id as string)

    // return if we don't have a player object for ourself
    if (!player) return;

    // make a blank input object.
    let input = { v: 0, h: 0, action: false }

    // check if our up or down key is pressed.
    if (this.inputs.up.isDown) {
      input.v = -1;
    } else if (this.inputs.down.isDown) {
      input.v = 1;
    }

    // check if our left or right key is pressed.
    if (this.inputs.left.isDown) {
      input.h = -1;
    } else if (this.inputs.right.isDown) {
      input.h = 1;
    }

    if (this.inputs.space.isDown) {
      input.action = true
    }

    // send the input to the server.
    State.channel.emit('actions', input);

    // do client-side prediction.
    player.applyInput(input)
    player.runAnimations(player)
  }

  updatePlayers() {
    // grab our currently interpolated players state.
    const snapshot = this.SI.calcInterpolation('x y', 'players')

    if (snapshot === undefined) return

    const { state } = snapshot

    // loop through all the players in our state.
    for (let s = 0; s < state.length; s++) {
      const playerState = state[s]

      // grab our player by their id, or create them if there isn't one.
      // @ts-ignore
      let player:Player = this.players.has(playerState.id) ? this.players.get(playerState.id) : this.createPlayer(playerState)

      // update our player action
      player.action = playerState.action as unknown as boolean

      // update our body position.
      // @ts-ignore
      player.body.setPosition(PL.Vec2(playerState.x, playerState.y))

      // calculate our animations
      // @ts-ignore
      if (player.id !== State.channel.id) player.runAnimations(playerState)
    }
  }

  createPlayer(data:Entity) {
    const player = new Player(this, data)

    // @ts-ignore
    this.add.existing(player)
    this.players.set(data.id, player)

    if (player.id === State.channel.id) this.cameras.main.startFollow(player)

    return player
  }
}