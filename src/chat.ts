import axios from 'axios';
import { Chunk, Message } from './types';
import { system_prompt } from './copy';

const VIDEO_SEGMENT_REGEX = /\[Video Segment (\d+)\]/g

export const defaultConversation: Message[] = [
    { role: "system", content: system_prompt},
    { role: "assistant", content: "What would you like to know about technology?" }
];

export const processChatTextForEmbed = (message: Message): string => {
    return message.content.split(VIDEO_SEGMENT_REGEX).reduce((acc, part, index) => {
        if (index % 2 === 0) {
            acc.push(part);
        } else {
            const index = parseInt(part);
            if (message.chunks && message.chunks.length > index) {
                const chunk = message.chunks[index]
                const videoUrl = "https://www.youtube.com/embed/" + chunk.youtube_id + "?start=" + Math.floor(chunk.start_time);
                const title = chunk.title;
                acc.push(`![${title}](${videoUrl})`);
            } else {
                acc.push("");
            }
        }
        return acc;
    }, [] as (string | Chunk)[])
    .join("");
}

export const processChatTextForLLM = (message: Message): string => {
    return message.content
        .split(VIDEO_SEGMENT_REGEX)
        .reduce((acc, part, index) => {
            if (index % 2 === 0) {
                acc.push(part);
            } else {
                const index = parseInt(part.replace("[Video Segment ", "").replace("]", ""));
                if (message.chunks && message.chunks.length > index) {
                    const {text, speaker, title} = message.chunks[index]
                    acc.push(`[Embedded Video Segment START ${index} with properties: \nTitle: ${title}\nSpeaker: ${speaker}\nTranscript: ${text} END Embedded Video Segment]`);
                } else {
                    acc.push(`[Embedded Video Segment ${index} not found]`);
                }
            }
            return acc;
        }, [] as string[])
        .join("")
}

export const sendMessage = async (inputText: string, chat: any[], onSuccess: (message: Message) => void, onError: (error: string) => void) => {
    if (inputText.trim() === '') return;

    const history = chat.map(mes => {
        return {
            role: mes.role,
            content: processChatTextForLLM(mes)
        }
    })

    try {

        const response = await axios.post('/api/chatapi', {input: inputText, history});
        const chunks = response.data.chunks;
        const assistantMessage = response.data.completion;

        onSuccess({ role: 'assistant', content: assistantMessage, chunks: chunks });

    } catch (error) {
        console.error('Error sending message:', error);
        onError(String(error));
    }
}
