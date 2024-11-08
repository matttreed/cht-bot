"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import "../app/globals.css";
import {defaultConversation, sendMessage} from "../src/chat";
import { Message } from "../src/types";
import { RotatingLines } from "react-loader-spinner";
import { sleep } from "openai/core.mjs";
import ChatMessage from "../src/components/ChatMessage";
import ChatInput from "../src/components/ChatInput";

const url = '/api/chatapi';

export default function Home() {
  const [chat, setChat] = useState<Message[]>(defaultConversation);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     const scrollIncrement = 50; // The amount to scroll (in pixels)
  //     const newScrollTop = scrollRef.current.scrollTop + scrollIncrement;
      
  //     // Ensure you don't scroll beyond the bottom
  //     scrollRef.current.scrollTop = Math.min(newScrollTop, scrollRef.current.scrollHeight - scrollRef.current.clientHeight);
  //   }
  // }, [chat]);

  const addMessage = (message: Message) => {
    setChat(curr_chat => [...curr_chat, message]);
  }

  const onServerError = (error: string) => {
    addMessage({role: 'assistant', content: error});
  }

  const onSubmitText = async (text: string) => {
    setLoading(true);
    addMessage({role: 'user', content: text});
    await sendMessage(text, chat, addMessage, onServerError);
    setLoading(false);
  }

  const loadingAnimation = () => {
    return (<div className="flex items-center justify-center w-full py-8">
      <RotatingLines
        visible={true}
        width="32"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        strokeColor="grey"
      />
    </div>)
  }

  return (
    <main className="h-screen bg-zinc-800 text-white font-sans">
      <div className="h-full flex flex-col w-full">
        <div className="flex-1 py-8 overflow-y-auto" ref={scrollRef}>
          <div className="h-64"/>
          <div className="w-1/2 mx-auto">
            {chat.map((mes, index) => {
              return <ChatMessage mes={mes} key={index}/>
            })}
            {loading && loadingAnimation()}
          </div>
        </div>
        <div className="pt-4 bg-zinc-700 flex justify-center">
          <ChatInput onSubmit={onSubmitText}/>
        </div>
      </div>
    </main>
  );
}
