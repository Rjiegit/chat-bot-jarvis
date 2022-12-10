import type {NextApiRequest, NextApiResponse} from 'next'
import {getChatResult} from "../../ChatGPT/ChatGPT";


interface ChatNextApiRequest extends NextApiRequest {
    body: {
        question: string
    },
    query: {
        question: string
    }

}

export default async function handler(
    req: ChatNextApiRequest,
    res: NextApiResponse
) {

    const question = req.query.question || req.body.question || 'hello'

    const result = await getChatResult(question)

    return res.json({
        data: result.data
    })

}