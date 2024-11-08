
import {Message, Chunk} from "@/src/types"
import { processChatTextForEmbed } from "../chat";
import CustomMarkDown from "./CustomMarkdown";
import React from "react";
import ExtraInfo from "./ExtraInfo";

const ChatMessage = React.memo(({mes}: {mes: Message}) => {

    if (mes.role == "user") {
        return (
            <div className={"pb-8"}>
                <div className="">
                    <p className="text-lg bg-zinc-600 rounded-3xl py-3 px-6 ml-auto w-1/2">{mes.content}</p>
                </div>
            </div>)
    }
    // const container_classes = mes.role == "assistant" ? "mr-32" : "ml-32";
    const sections = processChatTextForEmbed(mes);

    if (mes.role == "system") {
        return <ExtraInfo title="System Prompt" extra_info={mes.content}/>
    }

    const extra_info = `
    ${mes.question}
    ${mes.chunks?.map((doc, index) => {
        return `${doc.title} - ${doc.distance}`
    })}
    `

    return (
        <div className={"pb-8"}>
            {mes.chunks && mes.question && <ExtraInfo title="Query Processing" extra_info={extra_info}/>}
            <CustomMarkDown
                content={sections}
                className={""}
            />
        </div>
    )
})

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;