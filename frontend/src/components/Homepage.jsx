import ChatRoom from "./ChatRoom"
import RoomSelector from "./RoomSelector.jsx"
import { useEffect, useState } from 'react'
import { socket } from '../socket.js'

const Homepage = ({user, setUser, notify}) => {
  // State for storing roomid
  const [room, setRoom] = useState(null)
  
  // State for storing messages
  const [messages, setMessages] = useState([])

  // State for storing the number of online users
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

  // State for storing the list of rooms available to join
  const [roomsList, setRoomsList] = useState([
    {
      id: 1,
      connected: 3
    }, 
    {
      id: 2,
      connected: 2
    },
    {
      id: 3,
      connected: 1
    }
  ])

  // on 'connect' event handler
  const onConnect = () => {
    console.log('Connected to server')
  }

  // for handling disconnect event
  const onDisconnect = () => {
    console.log('disconnected from server')
  }

  // For handling connection error event
  const onConnectionError = (err) => {
    // For notifying if connection to the server failed
    if (err.message.includes('xhr poll error')){
      notify('Network Error', 'Please try again later')
      setUser(null)
      window.localStorage.removeItem('chat user')
      setMessages([])
    } else if (err.message.includes('expired')){
      notify('Authentication Expired', 'Please re-login')
      setUser(null)
      window.localStorage.removeItem('chat user')
      setMessages([])
    }
    console.log('Connection to server failed!! Message from server:', err.name, err.message)
    console.error(err)
  }

  // Event handler for online user count info
  const onOnlineUserCount = usersOnline => {
    setOnlineUsersCount(usersOnline)
  }

  // For handling user connected events
  const onUserConnected = (message) => {
    setMessages(previous => previous.concat(message))
    setOnlineUsersCount(previous => previous + 1)
  }

  // For handling user diconnect events
  const onUserDisconnect = (message) => {
    setMessages(previous => previous.concat(message))
    setOnlineUsersCount(previous => previous - 1)
  }

  // For handling room history event
  const onRoomHistory = (history) => {
    setMessages(history)
  }

  // For handling a chatmessage event
  const onChatMessage = (message) => {
    setMessages(previous => previous.concat(message))
  }

  // For registering event handlers once a user has logged in and connected
  useEffect(() => {

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectionError)
    socket.on('online users count', onOnlineUserCount)
    socket.on('user connected', onUserConnected)
    socket.on('user disconnected', onUserDisconnect)
    socket.on('room history', onRoomHistory)
    socket.on('chat message', onChatMessage)

    // Sets the authorisation object for the connection before connecting
    socket.auth = user
    socket.connect()

    // Cleanup function for when the component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectionError);
      socket.off('online users count', onOnlineUserCount);
      socket.off('user connected', onUserConnected);
      socket.off('user disconnected', onUserDisconnect);
      socket.off('room history', onRoomHistory);
      socket.off('chat message', onChatMessage);
      socket.disconnect();
    };
  }, [])

  // Function for leaving a room and clearing room and message data
  const handleLeaveRoom = () => {
    setMessages([])
    setRoom(null)
  }

  // Function for rendering chatroom if there is a room id
  const renderChatroom = () => {
    return (
      <ChatRoom user={user} 
        setUser={setUser} 
        notify={notify} 
        messages={messages} 
        room={room}
        handleLeaveRoom={handleLeaveRoom}
        onlineUsersCount={onlineUsersCount}></ChatRoom>
    )
  }
  
  // Function for rendering the room selector
  const renderRoomSelector = () => {
    return (
      <RoomSelector roomsList={roomsList} setRoom={setRoom} notify={notify}></RoomSelector>
    )
  }

  return (
    <div id='homepageDiv'>
      <button id='logoutbutton' onClick={() => {
        setUser(null)
        window.localStorage.removeItem('chat user')
      }}>Logout</button>
    {room && renderChatroom()}
    {!room && renderRoomSelector()}
    </div>
  
  )
}

export default Homepage