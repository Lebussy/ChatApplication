const Message = ({message}) => {
  return (
    <li>
      <span className="user">{message.user}:</span>
      <span className="message-text">{message.content}</span>
      <span className="message-time">{new Date(message.time).toLocaleString()}</span>
    </li>
  )
}

export default Message