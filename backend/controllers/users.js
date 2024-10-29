import express from 'express'
const userRouter = express.Router()
import User from '../models/user.js'
import bycrypt from 'bcryptjs'

// Route for posting new user to the database
userRouter.post('/', async (req, res) => {
  // destructures the required details from the request body
  const { name, username, password } = req.body
  // Ensures that the request contains the required information
  if (!name || !username || !password){

    return res.status(400).json({
      error: 'All fields required'
    })
  }

  // Creates the new user
  const passwordHash = await bycrypt.hash(password, 10)
  const newUser = new User({
    name,
    username,
    passwordHash
  })

  // Saves the new user to the database
  const createdUser = await newUser.save()

  // Returns the created user to the client
  res.status(201).json({
    username: createdUser.username,
    name: createdUser.name
  })
})

export default userRouter