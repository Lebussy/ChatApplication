import Message from "../models/message.js"
import Room from '../models/room.js'

// helper method for deleting the messages in the database
const deleteMessages = async () => {
  await Message.deleteMany({})
}

// helper method for retrieving the rooms that the user can connect to 
const getRooms = async () => {
  return await Room.find({})
}

// helper method for returning the messages associated with a room id
const getMessageHistory = async (roomId) => {
  const messageDocuments = await Message.find({room: roomId}).populate('user')
  return messageDocuments
}

// helper method for persisting a message to the database
const persistMessage = async (message) => {
  const newMessage = new Message(message)
  await newMessage.save()
}
export default {deleteMessages, getRooms, getMessageHistory, persistMessage}