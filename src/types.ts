export type Doc = {
    url: string;
    image_url: string;
    title: string;
    quote: string;
    speaker: string;
}

export type Message = {
    role: string;
    content: string;
    docs?: Doc[];
}

