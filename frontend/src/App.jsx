import ChatRoom from './components/Chatroom.jsx'
import {socket} from './socket.js'
import { useEffect, useState } from 'react'
import './styles.css'

const App = () => {
  // State for storing messages
  const [messages, setMessages] = useState([])
  // Temp user state
  const [user, setUser] = useState({
    username: `aSickUser${Math.floor(Math.random() * 2000)}`,
    name: 'bartSimpson'
  })

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
      console.log('#################################')
      console.log()
      console.log(message)
      setMessages(previous => previous.concat(message))
    })
  }, [])

  return (
    <>
      <ChatRoom messages={messages} user={user}></ChatRoom>
    </>
  )
}

export default App
