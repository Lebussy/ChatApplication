const Message = ({message}) => {
  let extraStyle = {}
  if (message.type === 'info') {
    extraStyle = {color:'red'}
  }
  return (
    <li>
      <span style={extraStyle} className="user">{message.user}:</span>
      <span className="message-text">{message.content}</span>
      <span className="message-time">{new Date(message.time).toLocaleString() || ''}</span>
    </li>
  )
}

export default Message