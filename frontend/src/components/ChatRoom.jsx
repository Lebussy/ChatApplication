import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import { useEffect, useState } from 'react'
import { socket } from '../socket.js'
import RoomInfo from './RoomInfo.jsx'

const ChatRoom = ({ user, setUser, notify }) => {
  // State for storing messages
  const [messages, setMessages] = useState([])

  // State for storing the number of online users
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

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
      // For notifying if connection to the server failed
      if (err.message.includes('xhr poll error')){
        notify('Network Error', 'Please try again later')
        setUser(null)
        window.localStorage.removeItem('chat user')
        socket.disconnect()
        setMessages([])
      } else if (err.message.includes('expired')){
        notify('Authentication Expired', 'Please re-login')
        setUser(null)
        window.localStorage.removeItem('chat user')
        setMessages([])
        socket.disconnect()
      }
      console.log('Connection to server failed!! Message from server:', err.name, err.message)
    })

    // Event handler for the initial number of online users
    socket.on('online users count', usersOnline => {
      setOnlineUsersCount(usersOnline)
    })

    socket.on('user connected', (message) => {
      setMessages(previous => previous.concat(message))
      setOnlineUsersCount(previous => previous + 1)
    })

    socket.on('user disconnected', (message) => {
      setMessages(previous => previous.concat(message))
      setOnlineUsersCount(previous => previous - 1)
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

  
  return (
    <div id='divBehindChatroom'>
      <button id='logoutbutton' onClick={() => {
        setUser(null)
        window.localStorage.removeItem('chat user')
        socket.disconnect()
      }}>Logout</button>
    <div className="chatroom">
      <RoomInfo onlineUsersCount={onlineUsersCount}></RoomInfo>
      <ChatHistory messages={messages} user={user}/>
      <MessageForm user={user}/>
    </div>
    </div>
  )
}

export default ChatRoom