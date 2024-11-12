import { Schema, model } from "mongoose"

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
},{
  toJSON: {
    transform: (document, returnedObject) => {
      returnedObject.id = document._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  }
})

const Room = model('Room', roomSchema)

export default Room