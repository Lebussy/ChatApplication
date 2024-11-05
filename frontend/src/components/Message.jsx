const Message = ({message}) => {
  return (
    <li>
      <span className="user">{message.user}:</span>
      <span className="message-text">{message.text}</span>
    </li>
  )
}

export default Message