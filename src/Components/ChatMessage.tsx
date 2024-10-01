
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
    const align = mes.role == "assistant" ? "text-left pr-16" : "text-right pl-16";
    // const container_classes = mes.role == "assistant" ? "mr-32" : "ml-32";
    const sections = processChatTextForEmbed(mes);

    console.log(sections)

    if (mes.role == "system") {
        return null;
    }

    return (
        <div className={"pb-8"}>
            <CustomMarkDown
                content={sections}
                className={align}
            />
        </div>
    )
})

export default ChatMessage;