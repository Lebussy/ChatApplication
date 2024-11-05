import { useEffect, useRef } from "react";
import Message from "./Message";

const ChatHistory = ({ messages }) => {
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div id="chatHistoryBox" ref={chatHistoryRef}>
      <ul>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;