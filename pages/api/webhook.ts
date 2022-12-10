import type {NextApiRequest, NextApiResponse} from 'next'
import {
    ClientConfig,
    Client,
    middleware,
    MiddlewareConfig,
    WebhookEvent,
    TextMessage,
    MessageAPIResponseBase
} from '@line/bot-sdk';

const clientConfig: ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
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

    // Create a new message.
    const response: TextMessage = {
        type: 'text',
        text,
    };

    // Reply to the user.
    await client.replyMessage(replyToken, response);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const events: WebhookEvent[] = req.body.events;

    const results = await Promise.all(
        events.map(async (event: WebhookEvent) => {
            try {
                await textEventHandler(event);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error(err);
                }

                // Return an error message.
                return res.status(500).json({
                    status: 'error',
                });
            }
        })
    );

    return res.status(200).json({
        status: 'success',
        results,
    });
}
