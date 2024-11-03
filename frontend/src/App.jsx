import ChatRoom from './components/Chatroom.jsx'
import {socket} from './socket.js'
import { useEffect, useState } from 'react'

const App = () => {
  // State for storing messages
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server')
      socket.emit('user connected')
    })

    socket.on('disconnect', () => {
      console.log('disconnected from server')
    })

    socket.on('user connected', () => {
      console.log('a user connected')
    })

    socket.on('chat message', (message) => {
      setMessages(previous => previous.concat(message))
    })
  }, [])

  return (
    <>
      <h1>Chat app!</h1>
      <ChatRoom messages={messages}></ChatRoom>
    </>
  )
}

export default App
