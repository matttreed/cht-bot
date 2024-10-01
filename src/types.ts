export type Chunk = {
    start_time: number;
    end_time: number;
    text: string;
    speaker: string;
    title: string;
    youtube_id: string;
}

export type Message = {
    role: "function" | "system" | "user" | "assistant" | "tool";
    content: string;
    chunks?: Chunk[];
}

