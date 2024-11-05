import MessageForm from './MessageForm'
import ChatHistory from './ChatHistory'

const ChatRoom = ({messages, user}) => {
  
  return (
    <div className="chatroom">
      <ChatHistory messages={messages}/>
      <MessageForm user={user}/>
    </div>
  )
}

export default ChatRoom