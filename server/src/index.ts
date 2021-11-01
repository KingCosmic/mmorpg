import geckos from '@geckos.io/server'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { State } from '@geckos.io/snapshot-interpolation/lib/types'
import PL from 'planck-js'

import Player from './entities/player'

// create our webrtc server for connections
const io = geckos()


io.listen(3000) // default port is 9208

// create our snapshot interpolation system
const SI = new SnapshotInterpolation()

// a map of player id's to their corresponding objects
const players:Map<String, Player> = new Map()

// our physics world (with zero gravity)
const world = PL.World(PL.Vec2(0, 0))

// an array of all our unprocessed input.
const unprocessedInput:any[] = [];

// our world state Type
interface WorldState {
  players:any[]
}

// the fps for our server process
const serverFPS = 30

// our connection handler
io.onConnection(channel => {
  // log a connection
  console.log('connected');

  // create a new player object for this connection
  const player = new Player(channel.id as string, world)

  // add the player to our map
  players.set(channel.id as string, player)

  // emit initial data to the new player.
  channel.emit('player-data', player.getUpdate())

  // setup our disconnect handler
  channel.onDisconnect(() => console.log(`${channel.id} got disconnected`))

  // our input event handler
  channel.on('input', (input) => {
    // add our players id to the input so we know who to apply this to.
    // @ts-ignore
    input.player_id = channel.id;

    // push this input so we can process it later.
    unprocessedInput.push(input)
  })

  // our disconnect event handler
  channel.onDisconnect(() => {
    // grab our player object.
    const player = players.get(channel.id as string)

    // no player object for this player? just return.
    if (!player) return;

    // log there was a dc
    console.log('a user disconnected')

    // destroy their body in the world.
    world.destroyBody(player.body);

    // and empty out the players map of them.
    players.delete(channel.id as string);
  })

  // our chat message event handler
  channel.on('chat-message', (content) => {
    // log the content of the message
    console.log(`got ${content} from "chat message"`)

    // emit the "chat message" data to all channels in the same room
    io.emit('chat-message', content)
  })
})

/**
 * this function processes all the input data we've recived from the clients
 */
function processInputs() {
  // if we've recieved no input since the last update just return.
  if (unprocessedInput.length === 0) return;

  // loop through each unprocessed input
  unprocessedInput.forEach(input => {
    // TODO: just ignore inputs that don't look valid; this is what prevents clients from cheating.

    // grab the player this input is for
    const player = players.get(input.player_id)

    // Update the state of the entity, based on its input.
    if (player) player.applyInput(input);
  })

  // empty our array once we're done.
  unprocessedInput.splice(0);
}


// Gather the state of the world. In a real app, state could be filtered to avoid leaking data
// (e.g. position of invisible enemies).
function generateWorldState(filterUpdated = false) {
  // create our empty state
  let world_state:WorldState = {
    players: []
  };

  // loop through our currently connected players.
  players.forEach(player => {
    // if our character wasn't updated and we're filtering updated users just return
    if (!player.wasUpdated && filterUpdated) return

    // change the updated flag if we're filtering.
    if (filterUpdated) player.wasUpdated = false

    // push the players update to the world state.
    world_state.players.push(player.getUpdate())
  })

  // return our generated world state.
  return world_state;
}

/**
 * generates and emits our world state to all clients.
 */
function sendWorldState() {
  // generate our snapshot from world state.
  const snapshot = SI.snapshot.create(generateWorldState() as unknown as State)

  // emit the snapshot to connected clients.
  io.emit('snapshot', snapshot)
}

/**
 * this is our world step.
 * 
 * it processes inputs, steps the physics world, and apply velocities
 */
setInterval(() => {
  // process our recieved inputs.
  processInputs()

  // advance the simulation by 1 / 60 seconds
  world.step(1 / 60);
  // crearForces  method should be added at the end on each step
  world.clearForces();

  // iterate through all bodies
  for (let b = world.getBodyList(); b; b = b.getNext()) {
    // set their velocity to 0 between updates.
    b.setLinearVelocity(PL.Vec2(0, 0))
  }
}, 1 / serverFPS)

// this is our hearbeat function, it sends out our updated world state every so often.
setInterval(sendWorldState, 50)