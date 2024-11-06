import ChatRoom from './components/Chatroom.jsx'
import Login from './components/Login.jsx'
import Notification from './components/Notification.jsx'
import { useEffect, useState } from 'react'

import './styles.css'

const App = () => {
  // State for storing the user
  const [user, setUser] = useState(null)

  // State for storing the notification
  const [notification, setNotification] = useState(null)

  // Effect hook for retrieving user from localstorage
  useEffect(() => {
    if (!user){
      try{
        setUser(JSON.parse(window.localStorage.getItem('chat user')))
      } catch {
        setUser(null)
        window.localStorage.removeItem('chat user')
      }
    }
  }, [])

  const notify = (type, message) => {
    setNotification({type, message})
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Method for rendering the chatRoom component
  const renderChatroom = () => {
    return (
      <ChatRoom user={user} setUser={setUser} notify={notify}></ChatRoom>
    )
  }

  // Method for rendering the login form
  const renderLoginForm = () => {
    return (
      <Login setUser={setUser} notify={notify}></Login>
    )
  }
  
  // If there is a user logged in, display the chatroom
  return (
    <div>
      <Notification notification={notification}></Notification>
      {user && renderChatroom()}
      {!user && renderLoginForm()}
    </div>
  )

}

export default App
