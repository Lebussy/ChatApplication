import 'express-async-errors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'
import Message from './models/message.js'
import jwt from 'jsonwebtoken'
import socketHelper from './utils/socketHelper.js'

// Countet for storing number of online users
let onlineUsers = 0;

// Creates an HTTP server for the express app to run on
const httpServer = createServer(app)

// Initialises socket.io with the server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})


// Socket.io middlewear for ensuring authentication
io.use((socket, next) => {
  
  const auth = socket.handshake.auth

  try{
    // Verifies the token and sets the auth attribute to the decoded token
    const decoded = jwt.verify(auth.token, process.env.SECRET)
    socket.handshake.auth = decoded
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

  // Sends the current number of online users
  socket.emit('online users count', onlineUsers)

  // For incrementing the online users count after connection and initialisation
  onlineUsers++
  console.log(`user connected, ${onlineUsers} online`)

  // For notifying all connected clients that a user has connected
  const connectionMessage = {
    content: `${auth.username} connected...`,
    time: Date.now(),
    type: 'CONNECT'
  }
  io.emit('user connected', connectionMessage)

  // For saving the connection message to the database
  const newConnectionMessage = new Message(connectionMessage)
  await newConnectionMessage.save()

  
  // For sending the chat history of the current room to the connected user
  const chatHistory = await socketHelper.getMessageHistory()
  socket.emit('room history', chatHistory)

  // Handles disconnect event
  socket.on('disconnect', async () => {
    logger.info(`${auth.username} disconnected`)
    onlineUsers--
    logger.info(`${onlineUsers} online`)

    // Disconnection message for the chatroom
    const disconnectMessage = {
      content: `${auth.username} disconnected...`,
      time: Date.now(),
      type: 'DISCONNECT'
    }
    
    // Emits a user disconnected event to the connected clients with the disconnect message
    io.emit('user disconnected', disconnectMessage)

    // Saves the user disconnect message to the chat history
    const newDisconnectMessage = new Message(disconnectMessage)
    await newDisconnectMessage.save()    
  })

  socket.on('chat message', async (message) => {

    const timeRecieved = Date.now()
    // Emits the message to the connected sockets
    io.emit('chat message', {
      ...message,
      time: timeRecieved,
      type: 'MESSAGE'
    })

    // Saves the message to the database
    const newChatMessage = new Message({
      content: message.content,
      time: timeRecieved,
      type: 'MESSAGE',
      user: auth.id
    })    
    await newChatMessage.save()
  })
})

// initialise the app to listen on the port
httpServer.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})