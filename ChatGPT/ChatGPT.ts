import axios from "axios";
import {CHAT_GPT_CONFIG} from '../config'

interface Completions {
    model: string
    prompt: string
    max_tokens: number
    temperature: number
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

    return await axios.post(url, data, {
        headers: {
            Authorization: `Bearer ${chatGPTToken}`
        }
    })
}