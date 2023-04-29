import ReactMarkdown from "react-markdown";
import Image from "next/image";

const Message = ({ role, content }) => {
  let textColor;
  switch (role) {
    case "user":
      textColor = "text-blue-300"; // Change to the color you want for the user
      break;
    case "assistant":
      textColor = "text-green-500"; // Change to the color you want for the assistant
      break;
    default:
      textColor = "text-gray-500"; // Default text color
      break;
  }

  return (
    <div className="my-4 mx-auto flex w-full max-w-4xl ">
      <Image
        src={
          role === "user"
            ? "/profile_placeholder.png"
            : role === "assistant"
            ? "/jobot.jpg"
            : "/jovian_avatar.jpeg"
        }
        height={40}
        width={40}
        alt="Avatar"
        className="self-start rounded-full border"
        unoptimized
      />
      <div className="flex-1 overflow-x-hidden pl-2">
        <div>
          <span className={`text-base font-medium text-white`}>
            {role === "user" ? "You: " : role === "system" ? "System" : "Artemis: "}
          </span>
        </div>

        <div className={`text-lg prose ${textColor}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;