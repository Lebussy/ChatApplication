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

  // State for tracking if the socket is connected
  const [isConnected, setIsConnected] = useState(false)

  // State for storing the temporary list of rooms available to join
  const [roomsList, setRoomsList] = useState([])

  // Function for attempting to join a room
  const handleJoinRoom = (room) => {
    socket.timeout(5000).emit('join room', room.id, (err, _response) => {
      if (err) {
        console.log(err.message)
        notify('Join Error', `Could not join room ${room.id}`)
        setRoom(null)
        window.localStorage.removeItem('room')
        return
      }
      setRoom(room)
      window.localStorage.setItem('room', JSON.stringify(room))
    })
  }

  // Function for leaving a room and clearing room and message data
  const handleLeaveRoom = () => {
    setMessages([])
    setRoom(null)
    window.localStorage.removeItem('room')
  }

  // Function for logging user out and removing user and rooms data
  const handleLogout = () => {
    handleLeaveRoom()
    setUser(null)
    window.localStorage.removeItem('chat user')
  }

  // For attempting to reconnect to the room in localstorage after disconnect
  // Checks if there is a room in local storage
  // isConnected dependency ensures the effect only run once socket is connected to server socket
  useEffect(() => {
    // First checks if the socket is connected
    if (isConnected && socket.connected){
      // Checks there is no 'room' state before attempting to retrieve from local storage
      if (!room) {
        try {
          const roomFromLocal = JSON.parse(window.localStorage.getItem('room'))
          if (roomFromLocal){
            console.log('##########effect hook called to restore room#######################')
            console.log('room from local:', roomFromLocal)
            // Emits a 'check room' event to the server to assure that the client socket is still connected to the room
            socket.timeout(5000).emit('check room', roomFromLocal.id, (error, response) => {
              if (error){
                // If there is an error with checkroom eg room not exist
                console.log('error with \'check room\' event')
                console.error(error)
                handleLeaveRoom()
              } else if (response === 'not_connected') {
                // If the room is not connected, a 'join room' request is sent to the server
                console.log('socket was not in the room, emitting join request')
                handleJoinRoom(roomFromLocal)
              } else {
                // If the room is connected, set the room state
                console.log('socket in room from local, setting room state')
                setRoom(roomFromLocal)
              }
            })
          }
        } catch (err) {
          console.error('Could not parse room from local storage ', err)
          handleLeaveRoom()
        }
      }
    }
  }, [isConnected, room, setIsConnected])


  // on 'connect' event handler
  const onConnect = () => {
    console.log('Connected to server')
    setIsConnected(true)
  }

  // for handling disconnect event
  const onDisconnect = () => {
    console.log('disconnected from server')
    setIsConnected(false)
  }

  // For handling a rooms list event and setting the roomsList state
  const onRoomsList = rooms => {
    setRoomsList(rooms)
  }

  // For handling connection error event
  const onConnectionError = (err) => {
    // For notifying if connection to the server failed
    if (err.message.includes('xhr poll error')){
      notify('Network Error', 'Please try again later')
      handleLogout()
    } else if (err.message.includes('expired')){
      notify('Authentication Expired', 'Please re-login')
      handleLogout()
    }
    handleLogout()
    console.log('Connection to server failed!! Message from server:', err.name, err.message)
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

  // For registering event handlers and then connecting socket once user logged in
  useEffect(() => {
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectionError)
    socket.on('rooms list', onRoomsList)
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
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectionError)
      socket.off('rooms list', onRoomsList)
      socket.off('online users count', onOnlineUserCount)
      socket.off('user connected', onUserConnected)
      socket.off('user disconnected', onUserDisconnect)
      socket.off('room history', onRoomHistory)
      socket.off('chat message', onChatMessage)
      socket.disconnect()
      setIsConnected(false)
    };
  }, [])


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
      <RoomSelector roomsList={roomsList} setRoom={setRoom} notify={notify} handleJoinRoom={handleJoinRoom}></RoomSelector>
    )
  }

  return (
    <div id='homepageDiv'>
      <button id='logoutbutton' onClick={handleLogout}>Logout</button>
    {room && renderChatroom()}
    {!room && renderRoomSelector()}
    </div>
  
  )
}

export default Homepage