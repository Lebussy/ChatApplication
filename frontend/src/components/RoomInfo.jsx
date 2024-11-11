import { socket } from "../socket.js"

const RoomInfo = ({room, handleLeaveRoom, notify, onlineUsersCount}) => {

  const handleLeave = () => {
    socket.timeout(5000).emit('leave room', room.id, (err, response) => {
      if (err){
        notify('Leave Error', `Could not leave room ${room.id}: ${err.message}`)
        return
      }
      console.log('leave room response!', response)
      handleLeaveRoom()
    })
    
  }

  return (
    <div id="roominfo">
      <span id="roomnumber">Room: {room.id}</span>
      <span id="usercount">Online: {onlineUsersCount}</span>
      <button id="leavebutton" onClick={() => handleLeave()}>Leave Room</button>
    </div>
  )
}

export default RoomInfo