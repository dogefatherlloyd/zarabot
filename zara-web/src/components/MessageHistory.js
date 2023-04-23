import { useEffect, useRef } from "react";
import Image from "next/image"; // Add this import

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
                return (
                  <div key={i} className="uploaded-image">
                    <Image src={base64Image} alt="User uploaded" layout="fill" objectFit="contain" />
                  </div>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        ))}
    </div>
  );
};

export default MessageHistory;