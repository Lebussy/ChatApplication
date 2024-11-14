import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import RoomInfo from './RoomInfo.jsx'

const ChatRoom = ({ user, messages, room, handleLeaveRoom, notify, usersInSameRoom}) => {
  
  return (
    <div className="chatroom">
      <RoomInfo notify={notify} room={room} handleLeaveRoom={handleLeaveRoom} usersInSameRoom={usersInSameRoom}></RoomInfo>
      <ChatHistory messages={messages} user={user}/>
      <MessageForm roomId={room.id} user={user}/>
    </div>
    
  )
}

export default ChatRoom