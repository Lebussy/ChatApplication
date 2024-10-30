import {test, beforeEach, after, describe} from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import app from '../app.js'
import supertest from 'supertest'
import helper from './testHelper.js'
import jwt from 'jsonwebtoken'

// Api to test
const api = supertest(app)

describe('When there are two users in the database...', () => {
  // Initialises the database with two users
  beforeEach(async () => {
    try{
      await helper.initialiseUsers()
    } catch (error) {
      console.log('Could not initialise users in login test')
      console.error(error)
    }
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

// Closes the connection to the database once the test has run
after(async () => {
  await mongoose.connection.close()
})

