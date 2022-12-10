import axios from "axios";

interface Completions {
    model: string
    prompt: string
    max_tokens: number
    temperature: number
}

const url = 'https://api.openai.com/v1/completions';

export async function getChatResult(question: string) {
    const chatGPTToken = process.env.CHAT_GPT_TOKEN

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