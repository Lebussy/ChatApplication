import axios from "axios";

const baseURL = 'http://localhost:3000/api'

const getInitialMessages = async () => {
  try{
    const response = await axios.get(`${baseURL}/messages`)
    return response.data
  } catch (e) {
    console.log('could not retrieve message history')
    console.error(e)
  }
}

export default {getInitialMessages}