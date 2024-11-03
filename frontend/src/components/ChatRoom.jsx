import Message from './Message'
import { socket } from '../socket'

const ChatRoom = ({messages}) => {
  const sendMessage = event => {
    event.preventDefault()
    const message = event.target.message.value
    socket.emit('chat message', message)
  }
  return (
    <div>
      <h2>Messages:</h2>
      <ul>{messages.map(message => {
        return (
          <Message key={message.id} message={message}></Message>
        )
      })}</ul>
      <form onSubmit={sendMessage}>
        <input name='message'></input>
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default ChatRoom