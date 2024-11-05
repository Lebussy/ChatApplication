import axios from "axios"

const baseURL = 'http://localhost:3000/api'

// Method for posting login credentials to the login api
const login = async (credentials) => {
  const response = await axios.post(`${baseURL}/login`, credentials)
  return response.data
}

export default {login}