
import express from 'express'
import 'express-async-errors' // Must be imported before route handlers so they can be patched
import userRouter from './controllers/users.js'
import loginRouter from './controllers/login.js'
import messagesRouter from './controllers/messages.js'
import middlewear from './utils/middlewear.js'
import mongoose from 'mongoose'
import logger from './utils/logger.js'
import config from './utils/config.js'
import cors from 'cors'


// The express application
const app = express()

// Allows cors
app.use(cors())

// For connecting mongoose to the correct uri
logger.info('connecting to mongodb...')
try {
  const url = config.MONGODB_URI
  await mongoose.connect(url)
  logger.info('connected to ', url)
} catch (error) {
  logger.info('could not connect to database', error.message)
}

// json parser for request bodies with the application/json Content-Type headers
app.use(express.json())

// Loggs request info to the console before passing it on to other handlers
app.use(middlewear.requestLogger)

if (process.env.NODE_ENV === 'production'){
  // For serving the static frontend dist
  app.use(express.static('dist'))
}

// Router for handling user requests
app.use('/api/users', userRouter)

// Router for login route
app.use('/api/login', loginRouter)

// Router for retrieving messages
app.use('/api/messages', messagesRouter)

// Router for when a request has no matching routes
app.use(middlewear.unknownEndpoint)

// Error handling middlewear
app.use(middlewear.errorHandler)

export default app