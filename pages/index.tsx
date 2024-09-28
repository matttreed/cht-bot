"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import "../app/globals.css";
import {defaultConversation, sendMessage} from "@/src/chat";
import { Message } from "@/src/types";
import { RotatingLines } from "react-loader-spinner";
import { sleep } from "openai/core.mjs";

const url = '/api/chatapi';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [chat, setChat] = useState<Message[]>(defaultConversation);
  const [loading, setLoading] = useState(false);

  const addMessage = (message: Message) => {
    setChat([...chat, message]);
  }

  const loadingAnimation = () => {
    return (<div className="flex items-center justify-center w-full">
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
    <main className="flex h-screen flex-col items-center justify-between p-24">
      <div className="w-1/2 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {chat.filter(mes => mes.role != "system").map((mes, index) => {
            const align = mes.role == "assistant" ? "text-left" : "text-right";
            const container_classes = mes.role == "assistant" ? "" : "pl-32";
            return (<div key={index} className={"p-4 " + container_classes}>
              <h1 className={"text-3xl " + align}>{mes.content}</h1>
              {mes.docs && mes.docs.length > 0 && (
                <div className="flex flex-col">
                  <h2 className="text-lg">Here are some interview clips that might be relevant:</h2>
                  <div className="flex inline-block">
                    {mes.docs.map((doc, index) => {
                      return (<a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <div className="rounded shadow-lg w-64 p-4">
                        
                        
                          <img
                            src={doc.image_url}
                            alt={doc.title}
                            className="w-full rounded h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="text-blue-500 text-lg font-semibold truncate">{doc.title}</h3>
                          </div>
                        </div>
                        </a>);
                    })}
                  </div>
                </div>
              )}
            </div>);
            })
          }
          {loading  && loadingAnimation()}
        </div>
        <div className="mt-4">
          <input 
            className="p-2 border border-gray-300 rounded w-full text-black" 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={async (e) => {
              if (e.key === 'Enter') {
                const userInput = inputText;
                setInputText("");
                setLoading(true);
                addMessage({role: 'user', content: userInput});
                await sleep(1000);
                await sendMessage(userInput, chat, addMessage);
                setLoading(false);
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
