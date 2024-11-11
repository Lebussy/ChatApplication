import Room from './Room'
import { socket } from '../socket.js'

const RoomSelector = ({setRoom, roomsList, notify}) => {

  const handleJoinRoom = (room) => {
    socket.timeout(5000).emit('join room', room.id, (err, _response) => {
      if (err) {
        console.log(err.message)
        notify('Join Error', `Could not join room ${room.id}`)
        return
      }
      setRoom(room)
    })
  }

  return (<div id="roomselector"> 
    <div className="titlediv">
      <h3 className="title">Select a room to start chatting!</h3>
    </div>
    <ul id="roomslist" >
      {roomsList.map(room => {
        return (
          <Room key={room.id} room={room} joinRoom={() => handleJoinRoom(room)}></Room>
        )
      })}
    </ul>
  </div>)
}

export default RoomSelector