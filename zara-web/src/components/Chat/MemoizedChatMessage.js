import { memo } from "react";
import ChatMessage from "./ChatMessage";

const MemoizedChatMessage = memo(
    ChatMessage,
    (prevProps, nextProps) => (
        prevProps.message.content === nextProps.message.content
    )
);

export default MemoizedChatMessage;