import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import RoomInfo from './RoomInfo.jsx'

const ChatRoom = ({ user, messages, room, handleLeaveRoom, notify, onlineUsersCount}) => {
  
  return (
    <div className="chatroom">
      <RoomInfo onlineUsersCount={onlineUsersCount} notify={notify} room={room} handleLeaveRoom={handleLeaveRoom}></RoomInfo>
      <ChatHistory messages={messages} user={user}/>
      <MessageForm roomId={room.id} user={user}/>
    </div>
    
  )
}

export default ChatRoom