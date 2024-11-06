import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import bcrypt from 'bcryptjs'

const loginRouter = express.Router()

loginRouter.post('/', async (req, res) => {

  const username = req.body.username
  const password = req.body.password

  // Ensures that a username and password is included in the request
  if (!username || !password) {
    return res.status(400).json({error: 'please include username and password'})
  }

  // Ensures that the username and password combination is correct
  const user = await User.findOne({username})
  if (!user || ! await bcrypt.compare(password, user.passwordHash)){
    return res.status(401).json({error: 'incorrect username/password combination'})
  }

  // Payload for the token
  const payload = {
    name: user.name,
    username: user.username,
    id: String(user._id)
  }

  // Returns a valid token that expires in 4h
  const token = jwt.sign(payload, process.env.SECRET, {expiresIn: 1})
  return res.status(200).json({
    username: user.username,
    name: user.name,
    token: token
  })

})

export default loginRouter

