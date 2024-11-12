const Room = ({room, joinRoom}) => {
  return (
    <li className="roomli">
      <div className="room-info">
        <span><b>Room:</b> {room.name}</span>
      </div>
      <button onClick={joinRoom}>Join</button>
    </li>
  )
}

export default Room
