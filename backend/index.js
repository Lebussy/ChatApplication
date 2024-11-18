import 'express-async-errors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'
import jwt from 'jsonwebtoken'
import dbHelper from './utils/dbHelper.js'

// For deleting all the messages in the database when the server restarts
logger.info('removing messages from db...')
try{
  await dbHelper.deleteMessages()
  logger.info('messages removed')
} catch (e) {
  logger.error('Could not delete db messages', e)
}

// Counter for storing number of users in each room
logger.info('initialising connected users object...')
let connectableRooms
try {
  const roomDocs = await dbHelper.getRooms()
  connectableRooms = roomDocs.map(roomDoc => {
    return {
      ...roomDoc.toJSON(),
      connected: 0
    }
  })
} catch (e) {
  logger.error('could not get joinable rooms from server', e)
}

// Method for decrementing the connected users count for a roomId
const decrementConnectedIn = (roomId) => {
  connectableRooms.forEach(room => {
    if (room.id === roomId) {
      room.connected--
    }
  })
}

// Method for incrementing the connected users count for a roomId
const incrementConnectedIn = (roomId) => {
  connectableRooms.forEach(room => {
    if (room.id === roomId){
      room.connected++
    }
  })
}

// Creates an HTTP server for the express app to run on
const httpServer = createServer(app)

// Initialises socket.io with the server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  },
  connectionStateRecovery: {
    skipMiddlewares: false
  }
})


// Socket.io middlewear for ensuring authentication
io.use((socket, next) => {
  const auth = socket.handshake.auth
  try{
    // Verifies the token and sets the auth attribute to the decoded token
    const decoded = jwt.verify(auth.token, process.env.SECRET)
    socket.handshake.auth = {...decoded, token: auth.token}
    next()
  } catch (e) {
    // If token varification fails, passes a new error to the next middlewear
    console.log('Validation failed!')
    next(new Error(e.message))
  }
})

// Event handler for when a client connects to the socket server
io.on('connect', async socket => {

  // Authorisation object from the client
  const auth = socket.handshake.auth

  // Emits the array of connectable rooms to the client upon connection
  socket.emit('rooms list', connectableRooms)

  // Subscribes socket to updates about the connectable rooms list
  socket.join('connectable_rooms_updates')
  
  // For handling a join room ack
  socket.on('join room', async (roomId, callback) => {

    // Checks that the roomId is in the list of connectable rooms
    if (!connectableRooms.some((room) => room.id === roomId)){
      // If roomId doesnt match any of the connectable rooms ids, responds to 'join room' with an error and returns
      callback(new Error('room not found'))
      return
    }

    // Unsubscribes to the rooms list updates
    socket.leave('connectable_rooms_list')

    // First checks that the client not connected to the room server-side already
    if ((!socket.rooms.has(roomId)) && !socket.connectedRoom){
      // Joins the socket to the room
      socket.join(roomId)

      // Updates the sockets 'connectedRoom' attribute
      socket.connectedRoom = roomId

      // Acknowledges the join room request to the socket
      callback()

      // Sends the current number of users in the room, or if undefined, sends 0
      const connectingRoom = connectableRooms.find(room => room.id === roomId)
      socket.emit('online users count', connectingRoom.connected || 0)

      // Increments the connected count for the room object in the connectableRooms array
      incrementConnectedIn(roomId) 

      // Issues update to the subscribed sockets
      io.to('connectable_rooms_updates').emit('rooms list', connectableRooms)

      // Emits a connection message to users in the room
      const connectionMessage = {
        content: `${auth.username} connected...`,
        time: Date.now(),
        type: 'CONNECT',
        room: roomId
      }
      io.to(roomId).emit('user connected', connectionMessage)

      // And saves it to the database
      try {
        await dbHelper.persistMessage(connectionMessage)
      } catch (e) {
        logger.error('could not persist message to db', e)
      }
      
    }

    // For sending the chat history of the current room to the connected user
    const chatHistory = await dbHelper.getMessageHistory(roomId)
    socket.emit('room history', chatHistory)

  })

  // Handles a 'leave room' request
  socket.on('leave room', async (roomId, callback) => {

    // Checks the socket is connected to the room server-side
    if (socket.rooms.has(roomId)) {
      // The requested room is left
      socket.leave(roomId)

      // For clearing the room attribute on the socket
      delete socket.connectedRoom

      //decrements the connected count on the leaving room
      decrementConnectedIn(roomId)

      // Emits update about the connectable rooms
      io.to('connectable_rooms_updates').emit('rooms list', connectableRooms)

      // Acknowledges the leave room request
      callback()

      // Disconnect message sent to the chatroom
      const disconnectMessage = {
        content: `${auth.username} disconnected...`,
        time: Date.now(),
        type: 'DISCONNECT',
        room: roomId
      }
      io.to(roomId).emit('user disconnected', disconnectMessage)

      // And saved to the database
      try {
        await dbHelper.persistMessage(disconnectMessage)
      } catch(e) {
        logger.error('Could not persist message to database',e)
      }
    } else {
      callback()
    }
  })

  // For handling a 'check room' event to validate socket connected to a room
  socket.on('check room', async (roomId, callback) => {
    if (socket.rooms.has(roomId)){
      const messageHistory = await dbHelper.getMessageHistory(roomId)
      socket.emit('room hisory', messageHistory)
      callback()
    } else {
      callback('not_connected')
    }
  })

  // Handles disconnect event
  socket.on('disconnect', async (reason) => {

    // Id of the room the socket was connected to
    const roomId = socket.connectedRoom

    // If the user was connected to a room on disconnect
    if (roomId){

      // Decrements the connected attribute on the connectable room object in the array
      decrementConnectedIn(roomId)

      // Emits update about connectable rooms to subscribed sockets
      io.to('connectable_rooms_updates').emit('rooms list', connectableRooms)

      // And removes the connectedRoom attribute 
      delete socket.connectedRoom

      // Disconnect message sent to the chatroom
      const disconnectMessage = {
        content: `${auth.username} disconnected...`,
        time: Date.now(),
        type: 'DISCONNECT',
        room: roomId
      }
      io.to(roomId).emit('user disconnected', disconnectMessage)

      // And saved to the database
      try {
        await dbHelper.persistMessage(disconnectMessage)
      } catch(e) {
        logger.error('Could not persist message to database',e)
      }
    } else {
    }
  })

  socket.on('chat message', async (message) => {
    const timeRecieved = Date.now()
    // Emits the message to the sockets in the same room
    io.to(message.roomId).emit('chat message', {
      ...message,
      time: timeRecieved,
      type: 'MESSAGE'
    })

    // Saves the message to the database
    try{
      const newChatMessage = {
        content: message.content,
        time: timeRecieved,
        type: 'MESSAGE',
        user: auth.id,
        room: message.roomId
      }
      await dbHelper.persistMessage(newChatMessage)
    } catch(e) {
      logger.error('could not persist chat message to database', e)
    }
  })
})

const PORT = config.PORT || 3000
// initialise the app to listen on the port
httpServer.listen(PORT, () => {
  logger.info('...listening on port ', PORT)
})