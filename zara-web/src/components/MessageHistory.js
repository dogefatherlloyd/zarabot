import { useEffect, useRef } from "react";
import Image from "next/image";
import { AiOutlineUser, AiOutlineRobot } from "react-icons/ai";

const MessageHistory = ({ history }) => {
  let messagesWindow = useRef();

  useEffect(() => {
    if (messagesWindow?.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [history]);

  const getAvatar = (role) => {
    if (role === "user") {
      return (
        <div className="rounded-full bg-blue-400 w-6 h-6 flex items-center justify-center">
          <AiOutlineUser className="text-white" />
        </div>
      );
    } else {
      return (
        <div className="rounded-full bg-red-400 w-6 h-6 flex items-center justify-center">
          <AiOutlineRobot className="text-white" />
        </div>
      );
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto py-2 px-2"
      ref={(el) => (messagesWindow.current = el)}
    >
      {history
        .filter((message) => message.role !== "system")
        .map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex"}>
            {message.role === "ai" && (
              <div className="mr-2">{getAvatar(message.role)}</div>
            )}
            <div className="flex flex-col">
              <div className={message.role === "user" ? "text-right" : "text-left"}>
                {message.content.split(/(\[Image: .+?\])/).map((part, i) => {
                  if (/\[Image: .+?\]/.test(part)) {
                    const base64Image = part.replace(/^\[Image: (.+?)\]$/, "$1");
                    return (
                      <div key={i} className="uploaded-image">
                        <Image
                          src={base64Image}
                          alt="User uploaded"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                {message.role === "user" ? (
                  <>
                    {getAvatar(message.role)}
                    <span className="ml-2">{message.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">{message.timestamp}</span>
                    {getAvatar(message.role)}
                  </>
                )}
              </div>
            </div>
            {message.role === "user" && (
              <div className="ml-2">{getAvatar(message.role)}</div>
            )}
          </div>
        ))}
    </div>
  );
};

export default MessageHistory;