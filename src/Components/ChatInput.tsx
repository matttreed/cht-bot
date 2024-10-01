import { useState } from "react";


const ChatInput = ({onSubmit}: {onSubmit: (text: string) => void}) => {
    const [inputText, setInputText] = useState("");
    return <textarea
        className="p-2 border border-gray-300 rounded w-full text-black"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={1} // initial number of rows
        style={{ resize: 'none', overflow: 'hidden' }} // disable resize and hide scrollbar
        onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto'; // reset height to auto
            target.style.height = `${target.scrollHeight}px`; // set height based on content
        }}
        onKeyPress={async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setInputText("");
            onSubmit(inputText);
        }
        }}
    />
}

export default ChatInput;