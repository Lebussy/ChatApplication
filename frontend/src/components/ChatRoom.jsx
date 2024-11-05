import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import { useEffect } from 'react'
import messageService from '../services/messages.js'
import { socket } from '../socket.js'

const ChatRoom = ({setMessages, messages, user}) => {
  // Once a chat ro

  // For connecting to the socket.io server and initialising messages
  useEffect(() => {
    socket.connect()
    const initialiseMessages = async () => {
      const initialMessages = await messageService.getInitialMessages()
      setMessages(initialMessages)
    }
    initialiseMessages()
  }, [])

   // For registering the socket event handlers
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
    <div className="chatroom">
      <ChatHistory messages={messages}/>
      <MessageForm user={user}/>
    </div>
  )
}

export default ChatRoom