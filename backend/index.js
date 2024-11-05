import 'express-async-errors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'
import Message from './models/message.js'
import User from './models/user.js'

// Creates an HTTP server for the express app to run on
const httpServer = createServer(app)

// Initialises socket.io with the server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

// Event handler for when a client connects to the socket server
io.on('connect', async socket => {
  logger.info('a user connected')

  socket.on('disconnect', () => {
    logger.info('a user disconnected')
  })

  socket.on('user connected', () => {
    socket.broadcast.emit('user connected')
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
      user: tempUser._id,
      time: timeRecieved
    })
    await newMessage.save()
  })
})

// initialise the app to listen on the port
httpServer.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})