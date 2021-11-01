import { Scene, Input } from 'phaser'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { Entity } from '@geckos.io/snapshot-interpolation/lib/types'

import Player from '../entities/Player'

import PL, { Vec2, World } from 'planck-js'
import WeatherSystem from '../systems/weather'
import State from '../state'
import Terrain from '../systems/terrain'
import { InputType } from 'types'

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
    shift:Input.Keyboard.Key
    space:Input.Keyboard.Key
  }

  inputSequenceNumber:number = 0;
  pendingInputs:InputType[] = []
  
  constructor() {
    super('game')
  }

  create() {
    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 1 pixels = 1 meter.
    this.worldScale = 2

    // world gravity, as a Vec2 object. It's just a x, y vector
    const gravity = PL.Vec2(0, 0)

    // this is how we create a Box2D world
    this.world = PL.World(gravity)

    // setup our socket channels
    State.connect()
    State.channel.onConnect(this.startServerListeners.bind(this))

    // and our input keys (there is a easier way then this I believe)
    // but Typescript doesn't like it :/
    this.inputs = {
      up: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
      shift: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SHIFT),
      space: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE),
    }

    // zoom our camera now because a lot of our size logic
    // uses the camera state (we zoom instead of scaling assets
    // because blitters (our tilemap render cant be scaled))
    this.cameras.main.setZoom(2)

    // our terrain system.
    new Terrain(this, 0, 0).renderTerrain()

    // our custom rain particles and cloud shadows
    this.weather = new WeatherSystem(this)

    // start our ui
    this.scene.run('gameui')
  }

  startServerListeners(error:any) {
    // if there was a error connecting to the server just log in the console.
    if (error) console.error(error.message)

    // when we recieve our player data.
    State.channel.on('player-data', (player:any) => {
      // create our player and store it in the state.
      State.player = this.createPlayer(player)

      // update our hotbar
      State.events.emit('update-hotbar')

      // and our health bar
      State.events.emit('update-health')
    })

    // when we recieve a snapshot from the server store it for processing.
    State.channel.on('snapshot', (snapshot:any) => this.SI.snapshot.add(snapshot))
  }

  update() {
    // Not connected yet.
    if (State.channel.id === undefined)
      return;

    // process input
    this.processInputs()

    // update our players.
    this.updatePlayers()

    // this sets the position of the weather emitter to stay in camera so we get nice rain :D
    this.weather.setPosition(this.cameras.main.worldView.x - 64, this.cameras.main.worldView.y - 64)
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

    // increment input sequence id
    this.inputSequenceNumber++

    // make a blank input object.
    let input:InputType = {
      // our input number for input reconsiliation
      isn: this.inputSequenceNumber,
      // vertical input
      v: 0,
      // horizontal input
      h: 0,
      // is our sprint button pressed?
      s: this.inputs.shift.isDown,
      // is our action button pressed?
      action: this.inputs.space.isDown
    }

    // check if our up or down key is pressed.
    if (this.inputs.up.isDown) {
      input.v = -1
    } else if (this.inputs.down.isDown) {
      input.v = 1
    }

    // check if our left or right key is pressed.
    if (this.inputs.left.isDown) {
      input.h = -1
    } else if (this.inputs.right.isDown) {
      input.h = 1
    }

    // send the input to the server.
    State.channel.emit('input', input);

    // do client-side prediction.
    player.applyInput(input)
    player.runAnimations(player)

    // save the input for later reconciliation
    this.pendingInputs.push(input)
  }

  updatePlayers() {
    // grab our currently interpolated players state.
    const snapshot = this.SI.calcInterpolation('x y', 'players')

    // if there no snapshot just return out.
    if (snapshot === undefined) return

    // grab the snapshot state
    const { state } = snapshot

    // loop through all the players in our state.
    for (let s = 0; s < state.length; s++) {
      const playerState = state[s]

      // grab our player by their id, or create them if there isn't one.
      let player:Player = this.players.has(playerState.id) ? this.players.get(playerState.id) as Player : this.createPlayer(playerState)

      // if the player is us.
      if (player.id === State.channel.id) {

        // update our player action
        player.action = playerState.action as unknown as boolean

        // update our body position.
        // @ts-ignore
        player.body.setPosition(PL.Vec2(playerState.x, playerState.y))
        
        // grab the index of the last processed input.
        const index = this.pendingInputs.findIndex(input => input.isn === playerState.isn)

        // remove all pending inputs up to the last processed one.
        this.pendingInputs.splice(0, index + 1)

        // loop through all remaining inputs and re apply them.
        for (let pi = 0; pi < this.pendingInputs.length; pi++) {
          player.applyInput(this.pendingInputs[pi])
        }
      } else {
        // update our player action
        player.action = playerState.action as unknown as boolean

        // update our body position.
        // @ts-ignore
        player.body.setPosition(PL.Vec2(playerState.x, playerState.y))

        // calculate our animations
        // @ts-ignore
        player.runAnimations(playerState)
      }
    }
  }

  createPlayer(data:Entity) {
    // create a new player object
    const player = new Player(this, data)

    // @ts-ignore add our player to out scene
    this.add.existing(player)

    // and add it to our player map
    this.players.set(data.id, player)

    // if this player is for us then make the camera follow it.
    if (player.id === State.channel.id) this.cameras.main.startFollow(player)

    // return the player.
    return player
  }
}