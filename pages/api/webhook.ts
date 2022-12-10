import type {NextApiRequest, NextApiResponse} from 'next'
import {
    ClientConfig,
    Client,
    WebhookEvent,
    TextMessage,
    validateSignature,
    SignatureValidationFailed
} from '@line/bot-sdk';
import {LINE_CONFIG} from '../../config'
import {getChatResult} from "../../chat/chat";

const clientConfig: ClientConfig = {
    channelAccessToken: LINE_CONFIG.CHANNEL_ACCESS_TOKEN,
    channelSecret: LINE_CONFIG.CHANNEL_SECRET
};

const client = new Client(clientConfig);

async function textEventHandler(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }

    const {replyToken} = event;
    const {text} = event.message;

    const result = await getChatResult(text)

    // Create a new message.
    const response: TextMessage = {
        type: 'text',
        text: result.data.choices[0].text.trim(),
    };

    return await client.replyMessage(replyToken, response);
}

interface WebhookNextApiRequest extends NextApiRequest {
    headers: {
        'x-line-signature': string
    },
    body: {
        events: any
    }
}

export default async function handler(
    req: WebhookNextApiRequest,
    res: NextApiResponse
) {

    try {
        validateSignature(req.headers['x-line-signature'], LINE_CONFIG.CHANNEL_SECRET, LINE_CONFIG.CHANNEL_ACCESS_TOKEN)
    } catch (error) {
        console.error(error);
        if (error instanceof SignatureValidationFailed) {
            return res.status(401).json({message: error.message})
        }
        return res.status(500).json({
            message: 'validate signature error',
        });
    }
    const events: WebhookEvent[] = req.body.events;

    try {
        const eventsPromise = events.map(async (event: WebhookEvent) => {
            return await textEventHandler(event);
        })
        await Promise.all(eventsPromise);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'text event handler error',
        });
    }

    return res.status(200).json({
        message: 'success',
    });
}
