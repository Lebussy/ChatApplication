import logger from './logger.js'

const errorHandler = (err, req, res, next) => {
  // Loggs the error name and message for debugging
  logger.error("Error Name:",err.name)
  logger.error("Error Message:", err.message)
  logger.error(err)

  // Sets the default status and error message
  let status = 500
  let message = 'Internal Server Error'

  // Checks the name of the error and changes the status and message appropriately
  if (err.name === 'MongoServerError'){
    if (err.message.includes('duplicate key')){
      status = 400
      message = 'username already exists'
    }
    // Mongo field validation error
  } else if (err.name === 'ValidationError'){
    status = 400
    message = err.message
  }

  // Returns the status and error message to the client
  return res.status(status).json({error: message})
}

// Middlewear for handling unknown endpoints
const unknownEndpoint = (req, res) => {
  return res.status(404).json({
    error: `We couldnt find that!`
  })
}

// For logging request method and body
const requestLogger = (req, res, next) => {
  const method = req.method
  const body = req.body
  logger.info(`METHOD: ${method}`)
  logger.info(`BODY: `, body)
  next()
}

export default {errorHandler, unknownEndpoint, requestLogger}