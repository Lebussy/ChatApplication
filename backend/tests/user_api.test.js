import {test, beforeEach, after, describe} from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import app from '../app.js'
import supertest from 'supertest'
import helper from './testHelper.js'
import jwt from 'jsonwebtoken'

const api = supertest(app)

describe('When there are two users in the database...', () => {

  beforeEach( async () => {
    await helper.initialiseUsers()
  })

  describe('attempting to create a new user...', () => {
    // Method for asserting that no new users were added to the database
    const assertUserCountUnchanged = async (usersAtStart) => {
      const usersNow = await helper.usersInDb()
      assert.equal(usersNow.length, usersAtStart.length, "user lengths should be the same")
    }

    test('with valid data succeeds.', async () => {
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
  
    test('with an existing username fails and returns correct status and error', async () => {
      // Gets the users at the start
      const usersAtStart = await helper.usersInDb()

      // Posts a user with an existing username
      const existingUsername = helper.initialUsers[0].username
      const response = await api.post('/api/users').send({
        username: existingUsername,
        name: 'validname',
        password: 'SuperStrong1!'
      })
      .expect(400)
      .expect('Content-Type', /application\/json/)

      // Asserts that no user was added
      await assertUserCountUnchanged(usersAtStart)

      // Asserts the correct error message sent
      assert(response.body.error === 'username already exists')
    })

    test('with a weak password fails', async () => {
      const usersAtStart = await helper.usersInDb()

      // Attempts to post a new user with a weak password
      const weakPassword = 'weak'
      const weakPasswordUser = {...helper.validNewUserData, password: weakPassword}
      const response = await api.post('/api/users').send(weakPasswordUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      // Asserts that no users were added to the database
      await assertUserCountUnchanged(usersAtStart)

      // Asserts that the correct error message was returned
      assert(response.body.error === 'password too weak')
    })

    describe('with a missing...', () => {

      test('username fails', async () => {

        const usersAtStart = await helper.usersInDb()

        // Attempts to add a new user without a username
        const validData = helper.validNewUserData
        delete validData.username
        const response = await api.post('/api/users').send(validData)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        // Asserts that a new user not added 
        await assertUserCountUnchanged(usersAtStart)
      })

      test('name fails', async () => {
        
        const usersAtStart = await helper.usersInDb()

        // Attempts to add a new user without a name
        const validData = helper.validNewUserData
        delete validData.name
        const response = await api.post('/api/users').send(validData)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        // Asserts that a new user not added 
        await assertUserCountUnchanged(usersAtStart)
      })

      test('password fails', async () => {
        
        const usersAtStart = await helper.usersInDb()

        // Attempts to add a new user without a password
        const validData = helper.validNewUserData
        delete validData.password
        const response = await api.post('/api/users').send(validData)
          .expect(400)
          .expect('Content-Type', /application\/json/)
        // Asserts that a new user not added 
        await assertUserCountUnchanged(usersAtStart)
      })
    })

  })

  describe('logging in...', () => {
    test('with correct credentials returns a valid token', async () => {
      // Posts valid credentials to the route
      const { username, password } = helper.initialUsers[0]
      const { body } = await api.post('/api/login').send({username, password})
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // Asserts that the token is defined 
      assert(body.token, 'token should be defined')

      // Asserts that the token is valid and the payload contains the correct username
      try {
        const decoded = jwt.verify(body.token, process.env.SECRET)
        assert.strictEqual(decoded.username, username, 'usernames of token and credentials should match')
      } catch (error) {
        console.log('test failed, token not valid')
        console.log(error.name)
        throw error
      }
    })

    test('with non-existing username returns correct status and error message', async () => {
      // Posts to login with a non-existant username
      const response = await api.post('/api/login')
        .send({username: 'doesntexist',
          password: 'SuperStrong1!'})
        .expect(401)
        .expect('Content-Type', /application\/json/)

      // Asserts no token sent with the response
      assert(!response.body.token, 'No token should be returned')

      // Asserts that the correct error message returned
      assert(response.body.error === 'incorrect username/password combination')
    })

    test('with incorrect password but valid username returns correct status and error message', async () => {
      const validUsername = helper.initialUsers[0].username
      // Posts to login with a non-existant username
      const response = await api.post('/api/login')
        .send({username: validUsername,
          password: 'SuperWrongPassword1!'})
        .expect(401)
        .expect('Content-Type', /application\/json/)

      // Asserts no token sent with the response
      assert(!response.body.token, 'No token should be returned')

      // Asserts that the correct error message returned
      assert(response.body.error === 'incorrect username/password combination')
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})


