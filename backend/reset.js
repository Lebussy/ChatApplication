import mongoose from 'mongoose'
import Message  from './models/message.js'
import Room from './models/room.js'
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

// logger.info('resetting available rooms')

// try {
//   await Room.deleteMany({})
//   logger.info('deleted')
//   const newRoom = new Room({
//     name: 'orange room'
//   })
//   await newRoom.save()

//   const secondRoom = new Room({
//     name: 'purple room'
//   })

//   await secondRoom.save()

//   logger.info('temp rooms initialised')
// } catch (error) {
//   logger.error('failed to initialise rooms', error)
// }



