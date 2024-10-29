
import express from 'express'
import 'express-async-errors' // Must be imported before route handlers so they can be patched
import userRouter from './controllers/users.js'
import middlewear from './utils/middlewear.js'
import mongoose from 'mongoose'
import logger from './utils/logger.js'
import config from './utils/config.js'


// The express application
const app = express()

// For connecting mongoose to the correct uri
logger.info('connecting to mongodb...')
try {
  const url = config.MONGODB_URI
  await mongoose.connect(url)
  logger.info('connected to ', url)
} catch (error) {
  logger.error('could not connect to database', error.message)
}

// json parser for request bodies with the application/json Content-Type headers
app.use(express.json())

// Router for handling user requests
app.use('/api/users', userRouter)

// Router for when a request has no matching routes
app.use(middlewear.unknownEndpoint)

// Error handling middlewear
app.use(middlewear.errorHandler)

export default app