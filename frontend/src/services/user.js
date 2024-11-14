import axios from "axios"

const baseURL = '/api'

// Method for posting login credentials to the login api
const login = async (credentials) => {
  const response = await axios.post(`${baseURL}/login`, credentials)
  return response.data
}

// Method for registering a new user
const register = async (credentials) => {
  const response = await axios.post(`${baseURL}/users`, credentials)
  return response.data
}

export default {login, register}