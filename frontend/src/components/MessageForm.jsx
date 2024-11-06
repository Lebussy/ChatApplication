import { useRef } from "react";
import { socket } from "../socket";

const MessageForm = ({user}) => {
  const textareaRef = useRef(null)
  const messageFormRef = useRef(null)

  // Event handler for sending a message to the server
  const sendMessage = event => {
    event.preventDefault()
    // Sends the message if the message was not just whitespace
    const content = event.target.message.value.trim()
    if (content !== ''){
      socket.emit('chat message', {
        content, 
        user: user.username
      });
      event.target.message.value = ""
    }
  };

  // 'Enter' keydown event for sumitting the closest form to the textarea
  const enterKeydownHandler = (event) => {
    if (event.key === 'Enter' && !event.shiftKey){  
      event.preventDefault()
      document.getElementById('sendMessageForm').submit()
    }
  }

  return (
    <div className="messageform" ref={messageFormRef}>
      <form onSubmit={sendMessage} id="sendMessageForm">
        <textarea
          name="message"
          ref={textareaRef}
          onKeyDown={enterKeydownHandler}
        ></textarea>
        <button type='submit'>Send</button>
      </form>
    </div>
  );
};

export default MessageForm;