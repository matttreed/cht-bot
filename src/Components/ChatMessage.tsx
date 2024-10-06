
import {Message, Chunk} from "@/src/types"
import { processChatTextForEmbed } from "../chat";
import CustomMarkDown from "./CustomMarkdown";
import React from "react";

const EmbeddedVideo = ({doc}:{doc: Chunk}) => {
    const videoUrl = "https://www.youtube.com/embed/" + doc.youtube_id + "?start=" + Math.floor(doc.start_time); //+ "&end=" + Math.floor(doc.end_time);
    return (
        <div className="py-4 pr-16">
        <iframe
            width="100%" // Adjust width/height as per your needs
            height="315"
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`YouTube video ${doc.title}`}
        />
        </div>
    );
}

const ChatMessage = React.memo(({mes}: {mes: Message}) => {

    const [clicked, setClicked] = React.useState(false);

    if (mes.role == "user") {
        return (
            <div className={"pb-8 w-1/2 mx-auto"}>
                <div className="">
                    <p className="text-lg bg-zinc-600 rounded-3xl py-3 px-6 ml-auto w-1/2">{mes.content}</p>
                </div>
            </div>)
    }
    // const container_classes = mes.role == "assistant" ? "mr-32" : "ml-32";
    const sections = processChatTextForEmbed(mes);

    console.log(mes)

    if (mes.role == "system") {
        return (
            <div 
                onClick={() => setClicked(c => !c)}
                className={"mb-8 w-1/2 mx-auto flex hover:pointer"}
            >
                <p className="text-lg bg-zinc-600 rounded-2xl py-2 px-4 bg-blue-300 hover:bg-blue-400">{clicked ? mes.content : "System Prompt"}</p>
            </div>
        )
    }

    return (
        <div className={"pb-8 w-1/2 mx-auto flex flex-col"}>
            {mes.question && mes.chunks && 
                <div 
                    onClick={() => setClicked(c => !c)}
                    className={"mb-8 py-2 px-4 rounded-2xl hover:pointer bg-blue-300 hover:bg-blue-400"}
                > 
                    <p className="text-lg">{"Extra Info"}</p>
                    {clicked && 
                        <div>
                        {mes.question && <p className="">{"We read your message as: " + mes.question}</p>}
                        {mes.chunks && mes.chunks.map((doc, index) => {
                            return <p className="" key={index}>{doc.title}</p>
                        })}
                        </div>
                    }
                </div>
            }
            <CustomMarkDown
                content={sections}
                className={""}
            />
        </div>
    )
})

export default ChatMessage;