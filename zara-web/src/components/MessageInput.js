import React, { useRef, useEffect } from "react";
import cn from "classnames";
import { AiOutlineSend, AiOutlinePaperClip } from "react-icons/ai";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import TextArea from "react-textarea-autosize";
import { useState } from "react";
import { toast } from "react-hot-toast";

const MessageInput = ({
  sending,
  sendMessages,
  handleFileUpload,
  placeholder = "Start typing here...",
}) => {
  const inputRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [filePreview, setFilePreview] = useState("");

  const handleSendClick = () => {
    if (!prompt) {
      toast.error("Enter a message before you hit send.");
      return;
    }

    sendMessages([{ role: "user", content: prompt }]);
    setPrompt("");
    setFilePreview("");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
      setFilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const Icon = sending ? HiOutlineDotsHorizontal : AiOutlineSend;

  useEffect(() => {
    !sending && inputRef?.current?.focus();
  }, [sending]);

  return (
    <div className="px-2 pb-2 border border-solid border-gray-400 rounded-md" style={{ padding: '0 10px' }}>
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-end rounded-md border p-4 pr-2 dark:border-gray-400">
          <TextArea
            ref={inputRef}
            minRows={1}
            maxRows={10}
            autoFocus
            disabled={sending}
            placeholder={sending ? "Wait for my response.." : placeholder}
            className={cn(
              sending && "bg-gray-100 text-gray-400",
              "w-full flex-1 resize-none self-center bg-transparent leading-tight focus:outline-none dark:border-gray-500"
            )}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSendClick();
              }
            }}
          />
          <label htmlFor="file-upload" className="ml-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
            />
            <button className="rounded-full flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-600 text-white text-lg">
              <AiOutlinePaperClip style={{ fontSize: 20 }} />
            </button>
          </label>
          <button
            className="rounded-full flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-600 text-white text-lg"
            title="Send"
            onClick={handleSendClick}
          >
            <Icon
              variant="primary"
              style={{ fontSize: 20 }}
              disabled={!prompt || sending}
            />
          </button>
        </div>
        {filePreview && (
          <div className="mt-2 flex justify-center">
            <img src={filePreview} alt="File preview" style={{ maxHeight: 150 }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;