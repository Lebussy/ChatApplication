import 'express-async-errors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'
import Message from './models/message.js'
import jwt from 'jsonwebtoken'
import socketHelper from './utils/socketHelper.js'

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
    next(new Error('Not authorised'))
  }
})


// Event handler for when a client connects to the socket server
io.on('connect', async socket => {
  // Authorisation object from the client
  const auth = socket.handshake.auth

  // For notifying all connected clients that a user has connected
  io.emit('user connected', auth.username)

  // For sending the chat history of the current room
  const chatHistory = await socketHelper.getMessageHistory()
  socket.emit('room history', chatHistory)

  socket.on('disconnect', () => {
    logger.info(`${auth.username} disconnected`)
    io.emit('user disconnected', auth.username)
  })

  socket.on('chat message', async (message) => {
    const timeRecieved = Date.now()
    // Emits the message to the connected sockets
    io.emit('chat message', {
      ...message,
      time: timeRecieved,
      id: String(Math.floor(Math.random() * 100000))
    })

    // Saves the message to the database
    const newMessage = new Message({
      content: message.content,
      user: auth.id,
      time: timeRecieved
    })
    await newMessage.save()
  })
})

// initialise the app to listen on the port
httpServer.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})