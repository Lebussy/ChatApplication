import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import { useEffect, useState } from 'react'
import { socket } from '../socket.js'

const ChatRoom = ({ user, setUser, notify }) => {
  // State for storing messages
  const [messages, setMessages] = useState([])

  // For authorising and connecting to the socket.io server and initialising messages
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server')
      socket.emit('user connected')
    })

    socket.on('disconnect', () => {
      console.log('disconnected from server')
    })

    // Event handler for failed connection
    socket.on('connect_error', err => {
      notify(err.message, `please re-login`)
      console.log('Connection to server failed!! Message from server:', err.message)
      window.localStorage.removeItem('chat user')
      setUser(null)
    })

    socket.on('user connected', (username) => {
      setMessages(previous => previous.concat({user: username, content:'connected...', time: Date.now(), type: 'info'}))
    })

    socket.on('user disconnected', (username) => {
      setMessages(previous => previous.concat({user: username, content:'disconnected...', time: Date.now(), type: 'info'}))
    })

    // For handling a message history event, containing the exisitng messages in the room 
    socket.on('room history', (history) => {
      setMessages(history)
    })

    socket.on('chat message', (message) => {
      setMessages(previous => previous.concat(message))
    })

    // Sets the authorisation object for the connection before connecting
    socket.auth = user
    socket.connect()
  }, [])

   // For registering the socket event handlers
   useEffect(() => {
    
  }, [])

  
  return (
    <div className="chatroom">
      <ChatHistory messages={messages}/>
      <MessageForm user={user}/>
    </div>
  )
}

export default ChatRoom