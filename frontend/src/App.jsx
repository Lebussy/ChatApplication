import ChatRoom from './components/Chatroom.jsx'
import Login from './components/Login.jsx'
import { useState } from 'react'
import './styles.css'

const App = () => {
  // State for storing messages
  const [messages, setMessages] = useState([])
  // Temp user state
  const [user, setUser] = useState(null)
  
  // If there is a user logged in, display the chatroom
  if (user){
    return (
      <ChatRoom 
        messages={messages} 
        setMessages={setMessages} 
        user={user}>
      </ChatRoom>
    )
  }

  return (
    <Login setUser={setUser}></Login>
  )
}

export default App
