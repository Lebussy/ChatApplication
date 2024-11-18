import { useRef } from "react";
import { useSocket } from "../SocketContext.jsx"

const MessageForm = ({user, roomId}) => {
  const textareaRef = useRef(null)
  const messageFormRef = useRef(null)

  const socket = useSocket()

  // Event handler for sending a message to the server
  const sendMessage = event => {
    event.preventDefault()
    // Sends the message if the message was not just whitespace
    const content = event.target.message.value.trim()
    if (content !== ''){
      socket.emit('chat message', {
        content, 
        user: user.username,
        roomId
      });
      event.target.message.value = ""
    }
  };

  // 'Enter' keydown event in text area calls the send message event
  const handleEnterKeydown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      // Calls the sendMessage funciton with a mock event object to satisfy the functions expectation of an event
      sendMessage({ preventDefault: () => {}, target: { message: textareaRef.current } });
    }
  };

  return (
    <div className="messageform" ref={messageFormRef}>
      <form onSubmit={sendMessage} id="sendMessageForm">
        <textarea
          name="message"
          ref={textareaRef}
          onKeyDown={handleEnterKeydown}
        ></textarea>
        <button type='submit'>Send</button>
      </form>
    </div>
  );
};

export default MessageForm;