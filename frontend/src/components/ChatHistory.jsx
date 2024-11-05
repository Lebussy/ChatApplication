import Message from "./Message"

const ChatHistory = ({messages}) => {
  return (
    <div id="chatHistoryBox">
      <ul>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </ul>
    </div>
  )
}

export default ChatHistory