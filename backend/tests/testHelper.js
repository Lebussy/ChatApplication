import User from '../models/user.js'
import bycrypt from 'bcryptjs'
import logger from '../utils/logger.js'

// Users to initialse the database with
const initialUsers = [
  {
    username: 'firstUser',
    name: 'sponge',
    password: 'SuperStrong1!'
  },
  {
    username: 'secondUser',
    name: 'starfish',
    password: 'SuperStrong1!'
  }
]

// Valid new user data
const validNewUserData = {
  username: 'validNewUser',
  name: 'squid',
  password: 'SuperStrong1!'
}

// For initialising the users to the database
const initialiseUsers = async () => {
  try {
    // Clears existing users from the db
    await User.deleteMany({})
    // Synchronously adds each of the initial users
    for (const user of initialUsers){
      // Creates the passwordHash from the initial users password
      const passwordHash = await bycrypt.hash(user.password, 10)
      const newUser = new User({
        name: user.name,
        username: user.username,
        passwordHash
      })
      await newUser.save()
    }
  } catch (error) {
    console.log('Failed to initialise users')
    console.error(error.name)
  }
}

// Returns the users currently in the database
const usersInDb = async () => {
  try {
    const users = await User.find({})
    return users
  } catch (error) {
    console.error(error)
    console.log('Error fetching users from db')
  }
}

export default {
  initialUsers,
  validNewUserData,
  initialiseUsers,
  usersInDb
}
