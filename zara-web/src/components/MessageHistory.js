import { useEffect, useRef } from "react";
import Message from "./Message";

const MessageHistory = ({ history }) => {
  let messagesWindow = useRef();

  useEffect(() => {
    if (messagesWindow?.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [history]);

  return (
    <div
      className="flex-1 overflow-y-auto py-2 px-2"
      ref={(el) => (messagesWindow.current = el)}
    >
      {history
        .filter((message) => message.role !== "system")
        .map((message, index) => (
          <div key={index} className={message.role === "user" ? "user-message" : "ai-message"}>
            {message.content.split(/(\[Image: .+?\])/).map((part, i) => {
              if (/\[Image: .+?\]/.test(part)) {
                const base64Image = part.replace(/^\[Image: (.+?)\]$/, "$1");
                return <img key={i} src={base64Image} alt="User uploaded" />;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        ))}
    </div>
  );
};

export default MessageHistory;