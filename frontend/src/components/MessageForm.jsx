import { useRef } from "react";
import { socket } from "../socket";

const MessageForm = ({user}) => {
  const textareaRef = useRef(null);
  const messageFormRef = useRef(null);

  const sendMessage = event => {
    event.preventDefault();
    const content = event.target.message.value;
    socket.emit('chat message', {
      content, 
      user: user.username
    });
    event.target.message.value = ""; 
  };


  return (
    <div className="messageform" ref={messageFormRef}>
      <form onSubmit={sendMessage}>
        <textarea
          name="message"
          ref={textareaRef}
        ></textarea>
        <button type='submit'>Send</button>
      </form>
    </div>
  );
};

export default MessageForm;