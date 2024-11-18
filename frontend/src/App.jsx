import Login from './components/Login.jsx'
import Notification from './components/Notification.jsx'
import UserRegistration from './components/UserRegistration.jsx'
import { useEffect, useState } from 'react'
import './styles.css'
import Homepage from './components/Homepage.jsx'
import { SocketProvider } from './SocketContext.jsx'

const App = () => {
  // State for storing the user
  const [user, setUser] = useState(null)

  // State for storing the notification
  const [notification, setNotification] = useState(null)

  // Not learnt express routers yet
  // State for storing a flag for user registration
  const [isRegistering, setIsRegistering] = useState(false)

  // Effect hook for retrieving user from localStorage
  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('chat user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error)
      setUser(null)
      window.localStorage.removeItem('chat user')
    }
  }, []);

  // Method for notifying user with popup
  const notify = (type, message) => {
    setNotification({type, message})
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Method for rendering the chatRoom component
  const renderHomepage = () => {
    return (
      <SocketProvider>
        <Homepage user={user} setUser={setUser} notify={notify}></Homepage>
      </SocketProvider>
    )
  }

  // Method for rendering the login form
  const renderLoginForm = () => {
    return (
      <Login setUser={setUser} notify={notify} setIsRegistering={setIsRegistering}></Login>
    )
  }

  // Method for rendering the registration form
  const renderRegistrationForm = () => {
    return (
      <UserRegistration setIsRegistering={setIsRegistering} notify={notify}></UserRegistration>
    )
  }
  
  // If there is a user logged in, display the chatroom
  return (
    <div>
      <Notification notification={notification}></Notification>
      {user && renderHomepage()}
      {!user && !isRegistering && renderLoginForm()}
      {!user && isRegistering && renderRegistrationForm()}
    </div>
  )

}

export default App
