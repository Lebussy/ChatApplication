import Room from './Room'


const RoomSelector = ({roomsList, handleJoinRoom}) => {

  

  return (<div id="roomselector"> 
    <div className="titlediv">
      <h3 className="title">Select a room to start chatting!</h3>
    </div>
    <ul id="roomslist" >
      {roomsList.map(room => {
        return (
          <Room key={room.id} room={room} joinRoom={() => handleJoinRoom(room.id)}></Room>
        )
      })}
    </ul>
  </div>)
}

export default RoomSelector