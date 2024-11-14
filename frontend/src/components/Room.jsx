const Room = ({room, joinRoom}) => {
  return (
    <li className="roomli">
      <div className="room-info">
        <span>Room:<b> {room.name}</b></span>
        <span>Connected:  <b>{room.connected}</b></span>
      </div>
      <button onClick={joinRoom}>Join</button>
    </li>
  )
}

export default Room
