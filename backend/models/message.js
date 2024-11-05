import mongoose, { Schema } from "mongoose";

const messageSchema = mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
},{
  toJSON: {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id // Adds id field
      delete returnedObject._id // Removes the _id field
      delete returnedObject.__v // Removes the __v field

      // Checks if the user field is populated
      if (returnedObject.user && mongoose.Types.ObjectId.isValid(returnedObject.user)){ 
        // If not populated, turns the user id to a string
        returnedObject.user = returnedObject.user.toString()
      } else if (returnedObject.user) {
        // If it is, returns just the username of the user
        returnedObject.user = returnedObject.user.username
      }
    }
  }
})

const Message = mongoose.model('Message', messageSchema)

export default Message