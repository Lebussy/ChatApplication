const Room = ({room, joinRoom}) => {
  return (
    <li className="roomli">
      <div className="room-info">
        <span>Room: {room.id}</span>
        <span>Connected: {room.connected}</span>
      </div>
      <button onClick={joinRoom}>Join</button>
    </li>
  )
}

export default Room
