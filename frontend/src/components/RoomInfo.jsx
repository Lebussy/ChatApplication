const RoomInfo = ({onlineUsersCount}) => {
  return (
    <div id="roominfo">
      <span id="roomnumber">Room: 1</span>
      <span id="usercount">Online: {onlineUsersCount}</span>
      <button id="leavebutton">Leave Room</button>
    </div>
  )
}

export default RoomInfo