import {test, beforeEach, after, describe} from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import app from '../app.js'
import supertest from 'supertest'
import helper from './testHelper.js'

const api = supertest(app)

describe('When there are two users in the database', () => {
  beforeEach( async () => {
    await helper.initialiseUsers()
  })

  test('creating a user with valid data succeeds', async () => {
    // Gets the users in the database at the start of the test
    const usersAtStart = await helper.usersInDb()

    // Posts valid user data to the server
    const userToAdd = helper.validNewUserData
    const response = await api.post('/api/users').send(userToAdd)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    // Gets the users in the database after the new user has been posted
    const usersAtEnd = await helper.usersInDb()

    // Asserts that the number of users has increased by 1
    assert.equal(usersAtEnd.length, usersAtStart.length + 1)

    // Asserts that the username is in the list of usernames returned
    const usernamesInDb = usersAtEnd.map(user => user.username)
    assert(usernamesInDb.includes(userToAdd.username))

    // Asserts that the correct username is returned from the server
    assert(response.body.username === userToAdd.username)
  })
})

after(async () => {
  await mongoose.connection.close()
})


