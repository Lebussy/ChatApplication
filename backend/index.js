import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'
import {createServer} from 'http'
import {Server} from 'socket.io'

// Creates an HTTP server for the express app to run on
const httpServer = createServer(app)

// Initialises socket.io with the server
const io = new Server(httpServer)

// Event handler for when a client connects to the socket server
io.on('connection', socket => {
  logger.info('a user connected')

  socket.on('disconnect', () => {
    logger.info('a user disconnected')
  })
})

// initialise the app to listen on the port
httpServer.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})