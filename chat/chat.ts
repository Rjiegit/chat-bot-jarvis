import axios from "axios";
import {CHAT_GPT_CONFIG} from '../config'

interface Completions {
    model: string
    prompt: string
    max_tokens: number
    temperature: number
}

interface Choice {
    text: string;
    index: number;
    logprobs?: any;
    finish_reason: string;
}

interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface ChatGPTResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Choice[];
    usage: Usage;
}

const url = 'https://api.openai.com/v1/completions';

export async function getChatResult(question: string) {
    const chatGPTToken = CHAT_GPT_CONFIG.TOKEN

    const data: Completions = {
        max_tokens: 1000,
        model: "text-davinci-003",
        prompt: question,
        temperature: 0,
    }

    return await axios.post<ChatGPTResponse>(url, data, {
        headers: {
            Authorization: `Bearer ${chatGPTToken}`
        }
    })
}