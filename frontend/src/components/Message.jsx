const Message = ({message, user}) => {
  // If the message is of type 'MESSAGE' render as a user message
  if (message.type === 'MESSAGE') {
    return (
      <li className="userMessage">
        <span className={message.user !== user.username ? 'user' : 'self'}>{message.user}:</span>
        <span className="message-text">{message.content}</span>
        <span className="message-time">{new Date(message.time).toLocaleString() || ''}</span>
      </li>
    )
  } else { // Else render an info message
    return (
      <li className={message.type === 'CONNECT' ? 'connectMessage' : 'disconnectMessage'}>
        <span className="info-text">{message.content}</span>
      </li>
    )
  }
}

export default Message