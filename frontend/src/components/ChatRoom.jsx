import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'
import RoomInfo from './RoomInfo.jsx'

const ChatRoom = ({ user, setUser, onlineUsersCount, messages}) => {
  
  return (
    <div id='divBehindChatroom'>
      <button id='logoutbutton' onClick={() => {
        setUser(null)
        window.localStorage.removeItem('chat user')
      }}>Logout</button>
    <div className="chatroom">
      <RoomInfo onlineUsersCount={onlineUsersCount}></RoomInfo>
      <ChatHistory messages={messages} user={user}/>
      <MessageForm user={user}/>
    </div>
    </div>
  )
}

export default ChatRoom