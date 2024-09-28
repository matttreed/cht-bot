import axios from 'axios';
import { Message } from './types';

export const defaultConversation: Message[] = [
    { role: "system", content: "You are a helpful assistant."},
    { role: "assistant", content: "How are you feeling today?" }
];

export const sendMessage = async (inputText: string, chat: any[], onSuccess: (message: Message) => void) => {
    if (inputText.trim() === '') return;

    const userMessage = { message: inputText, history: chat };
    chat.push({ role: 'user', content: inputText });

    try {

        const response = await axios.post('/api/chatapi', {input: userMessage, chat: chat});
        const docs = response.data.docs;
        const assistantMessage = response.data.response;

        console.log(response)

        onSuccess({ role: 'assistant', content: assistantMessage, docs: docs });

    } catch (error) {
        console.error('Error sending message:', error);
    }
}
