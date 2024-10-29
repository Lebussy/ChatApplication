import User from '../models/user.js'
import bycrypt from 'bcryptjs'
import logger from '../utils/logger.js'

// Users to initialse the database with
const initialUsers = [
  {
    username: 'firstUser',
    name: 'sponge',
    password: 'SuperStrong!'
  },
  {
    username: 'secondUser',
    name: 'starfish',
    password: 'SuperStrong!'
  }
]

// Valid new user data
const validNewUserData = {
  username: 'validNewUser',
  name: 'squid',
  password: 'SuperStrong!'
}

// For initialising the users to the database
const initialiseUsers = async () => {
  try {
    // Clears existing users from the db
    await User.deleteMany({})
    logger.info('users cleared from db')
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
    logger.info('users initialised')
  } catch (error) {
    logger.info('Failed to initialise users')
    logger.error(error.name)
  }
}

// Returns the users currently in the database
const usersInDb = async () => {
  try {
    const users = await User.find({})
    return users
  } catch (error) {
    logger.error(error)
    logger.info('Error fetching users from db')
  }
}

export default {
  initialUsers,
  validNewUserData,
  initialiseUsers,
  usersInDb
}
