import type {NextApiRequest, NextApiResponse} from 'next'
import {
    ClientConfig,
    Client,
    WebhookEvent,
    TextMessage,
    MessageAPIResponseBase,
    validateSignature, SignatureValidationFailed
} from '@line/bot-sdk';
import {LINE_CONFIG} from '../../config'
import {getChatResult} from "../../chat/chat";

const clientConfig: ClientConfig = {
    channelAccessToken: LINE_CONFIG.CHANNEL_ACCESS_TOKEN,
    channelSecret: LINE_CONFIG.CHANNEL_SECRET
};

const client = new Client(clientConfig);

async function textEventHandler(event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> {
    // Process all variables here.
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }

    // Process all message related variables here.
    const {replyToken} = event;
    const {text} = event.message;

    const result = await getChatResult(text)

    // Create a new message.
    const response: TextMessage = {
        type: 'text',
        text: result.data.choices[0].text.trim(),
    };

    // Reply to the user.
    await client.replyMessage(replyToken, response);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        validateSignature(req.body, LINE_CONFIG.CHANNEL_SECRET, LINE_CONFIG.CHANNEL_ACCESS_TOKEN)
    } catch (error) {
        console.error(error);
        if (error instanceof SignatureValidationFailed) {
            return res.status(401).json({message: error.message})
        }
        return res.status(500).json({
            message: 'error',
        });
    }
    const events: WebhookEvent[] = req.body.events;

    const results = await Promise.all(
        events.map(async (event: WebhookEvent) => {
            try {
                await textEventHandler(event);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(error);
                }

                // Return an error message.
                return res.status(500).json({
                    message: 'error',
                });
            }
        })
    );

    return res.status(200).json({
        message: 'success',
        results,
    });
}
