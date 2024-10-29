import logger from './logger.js'
import { passwordStrength } from 'check-password-strength'

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

const unknownEndpoint = (req, res) => {
  return res.status(404).json({
    error: `We couldnt find that!`
  })
}

const passwordStrongEnough = password => {
  const strengthResult = passwordStrength(password)
  console.log('############Stength result#####################')
  console.log(strengthResult)
}

export default {errorHandler, unknownEndpoint}