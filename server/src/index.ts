import geckos from '@geckos.io/server'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { State } from '@geckos.io/snapshot-interpolation/lib/types'
import PL from 'planck-js'

import Player from './entities/player'

const io = geckos()

io.listen(3000) // default port is 9208

const SI = new SnapshotInterpolation()

const players:Map<String, Player> = new Map()

const world = PL.World(PL.Vec2(0, 0))

const unprocessedInput:any[] = [];

interface WorldState {
  players:any[]
}

const serverFPS = 30

io.onConnection(channel => {
  console.log('connected');

  const player = new Player(channel.id as string, world)

  players.set(channel.id as string, player)

  channel.emit('player-data', player.getUpdate())

  channel.onDisconnect(() => console.log(`${channel.id} got disconnected`))

  channel.on('actions', (input) => {
    // @ts-ignore
    input.player_id = channel.id;
    unprocessedInput.push(input)
  })

  channel.onDisconnect(() => {
    const player = players.get(channel.id as string)

    // no player object for this player? just return.
    if (!player) return;

    console.log('a user disconnected')

    world.destroyBody(player.body);
    players.delete(channel.id as string);
  })

  channel.on('chat-message', data => {
    console.log(`got ${data} from "chat message"`)
    // emit the "chat message" data to all channels in the same room
    io.emit('chat-message', data)
  })
})

function processInputs() {
  if (unprocessedInput.length === 0) return;

  unprocessedInput.forEach(input => {
    // Update the state of the entity, based on its input.
    // We just ignore inputs that don't look valid; this is what prevents clients from cheating.
    let id = input.player_id;
    const player = players.get(id)
    if (player) player.applyInput(input);
  })
  unprocessedInput.splice(0);
}

function generateWorldState(filterUpdated = false) {
  // Gather the state of the world. In a real app, state could be filtered to avoid leaking data
  // (e.g. position of invisible enemies).
  let world_state:WorldState = {
    players: []
  };

  players.forEach(player => {
    if (!player.wasUpdated && filterUpdated) return

    if (filterUpdated) player.wasUpdated = false

    world_state.players.push(player.getUpdate())
  })

  return world_state;
}

function sendWorldState() {
  const snapshot = SI.snapshot.create(generateWorldState() as unknown as State)

  io.emit('update', snapshot)
}

setInterval(() => {
  processInputs()

  // advance the simulation by 1 / 60 seconds
  world.step(1 / 60);
  // crearForces  method should be added at the end on each step
  world.clearForces();

  // iterate through all bodies
  for (let b = world.getBodyList(); b; b = b.getNext()) {
    b.setLinearVelocity(PL.Vec2(0, 0))
  }
}, 1 / serverFPS)

setInterval(sendWorldState, 50)