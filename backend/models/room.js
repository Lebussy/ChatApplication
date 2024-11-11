import { Schema } from "mongoose"

const roomSchema = new Schema({
  messages: [{
    type: Schema.Types.ObjectId
  }],
  roomNumber: Number
})