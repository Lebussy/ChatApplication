import 'express-async-errors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'
import Message from './models/message.js'
import Room from './models/room.js'
import jwt from 'jsonwebtoken'
import socketHelper from './utils/socketHelper.js'

// Counter for storing number of online users
const connectedUsers = {}

// Creates an HTTP server for the express app to run on
const httpServer = createServer(app)

// Initialises socket.io with the server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  },
  connectionStateRecovery: {
    skipMiddlewares: false,
    maxDisconnectionDuration: 3*1000
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
    next(new Error(e.message))
  }
})

// Event handler for when a client connects to the socket server
io.on('connect', async socket => {

  // Authorisation object from the client
  const auth = socket.handshake.auth
  console.log(`${auth.username} socket connected`, `RESTORED?: ${socket.recovered}`)

  // Emits the available rooms to join to the client
  const availableRooms = await Room.find({})
  socket.emit('rooms list', availableRooms)

  // For handling a join room ack
  socket.on('join room', async (roomId, callback) => {
    console.log('join room request recieved!!')

    // Joins the socket to the room
    socket.join(roomId)

    // Updates the sockets 'connectedRoom' attribute
    socket.connectedRoom = roomId

    // Acknowledges the join room request to the socket
    callback()
 
    // Sends the current number of users in the room, or if undefined 0
    const currentlyInRoom = connectedUsers[roomId]
    socket.emit('online users count', currentlyInRoom || 0)

    // Increments the count of users connected to the room, or if undefined initialises to 1
    connectedUsers[roomId] = currentlyInRoom ? currentlyInRoom + 1 : 1

    console.log(`user ${auth.username} joined room ${roomId}`, connectedUsers)

    // Emits a connection message to users in the room
    const connectionMessage = {
      content: `${auth.username} connected...`,
      time: Date.now(),
      type: 'CONNECT',
      room: roomId
    }
    io.to(roomId).emit('user connected', connectionMessage)

    // And saves it to the database
    const newConnectionMessage = new Message(connectionMessage)
    await newConnectionMessage.save()

    // For sending the chat history of the current room to the connected user
    const chatHistory = await socketHelper.getMessageHistory(roomId)
    socket.emit('room history', chatHistory)
  })

  // Handles a 'leave room' request
  socket.on('leave room', async (roomId, callback) => {
    console.log('leave room request recieved!!')

    // If the socket has a connected room attribute
    if (socket.connectedRoom) {
      // The requested room is left
      socket.leave(roomId)

      // For clearing the room attribute on the socket
      delete socket.connectedRoom

      // Decrements the number of users in the connected users object
      connectedUsers[roomId]--

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
      const newDisconnectMessage = new Message(disconnectMessage)
      await newDisconnectMessage.save()
    } else {
      callback()
    }
  })

  // For handling a 'check room' event to validate socket connected to a room
  socket.on('check room', async (roomId, callback) => {
    console.log('###############checkroom called##################')
    console.log()
    if (socket.rooms.has(roomId)){
      console.log('#############did####################')
      console.log()
      const messageHistory = await socketHelper.getMessageHistory(roomId)
      socket.emit('room hisory', messageHistory)
      callback()
    } else {
      console.log('################not#################')
      console.log()
      callback('not_connected')
    }
  })

  // Handles disconnect event
  socket.on('disconnect', async (reason) => {

    console.log(`${auth.username} socket disconnected`, `REASON: ${reason}`, `Stored roomId: ${socket.connectedRoom}` )

    // Id of the room the socket was connected to
    const roomId = socket.connectedRoom

    // If the user was connected to a room on disconnect
    if (roomId){
      // Decrements the connected users count for that room
      connectedUsers[roomId]--
      logger.info(`${auth.username} disconnected from room ${roomId}`, connectedUsers)

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
      const newDisconnectMessage = new Message(disconnectMessage)
      await newDisconnectMessage.save()  
    } else {
      logger.info(`${auth.username} socket disconnected, was not in room`)
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
    const newChatMessage = new Message({
      content: message.content,
      time: timeRecieved,
      type: 'MESSAGE',
      user: auth.id,
      room: message.roomId
    })    
    await newChatMessage.save()
  })
})

// initialise the app to listen on the port
httpServer.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})