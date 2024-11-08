import mongoose from 'mongoose'
import Message  from './models/message.js'
import logger from './utils/logger.js'
import config from './utils/config.js'

// For connecting mongoose to the correct uri
logger.info('connecting to mongodb...')
try {
  const url = config.MONGODB_URI
  await mongoose.connect(url)
  logger.info('connected to ', url)
} catch (error) {
  logger.error('could not connect to database', error.message)
}

logger.info('Deleting messages in db...')

try{
  await Message.deleteMany({})
  logger.info('...deleted')
} catch (e) {
  logger.info('not deleted', e.message)
}



