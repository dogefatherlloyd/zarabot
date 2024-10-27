import ReactMarkdown from "react-markdown";
import Image from "next/image";

const Message = ({ role, content }) => {
  let textColor;
  switch (role) {
    case "user":
      textColor = "text-blue-300"; // Color for the user
      break;
    case "assistant":
      textColor = "text-green-500"; // Color for the assistant
      break;
    default:
      textColor = "text-gray-500"; // Default text color
      break;
  }

  // Safely process content: ensure it's a string or join array elements as a string
  const messageContent = Array.isArray(content)
    ? content.map((item) => (typeof item === 'string' ? item : '')).join(' ')
    : typeof content === 'string'
    ? content
    : '';

  return (
    <div className="my-4 mx-auto flex w-full max-w-4xl">
      <Image
        src={
          role === "user"
            ? "/profile_placeholder.png"
            : role === "assistant"
            ? "/eagle_silhouette_logo.png"
            : "/eagle_silhouette_logo.png"
        }
        height={40}
        width={40}
        alt="Avatar"
        className="self-start rounded-full border"
        unoptimized
      />
      <div className="flex-1 overflow-x-hidden pl-2">
        <div>
          <span className="text-base font-medium text-white">
            {role === "user" ? "You: " : role === "system" ? "System" : "Artemis: "}
          </span>
        </div>

        <div className={`text-lg prose ${textColor}`}>
          {/* Safely render Markdown content */}
          <ReactMarkdown>
            {messageContent || "Message content could not be loaded."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;