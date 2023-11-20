import type { NextApiRequest, NextApiResponse } from "next";
import { getMessages, sendMessage } from "../../api";

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { recipientId, oldestId, greater } = JSON.parse(req.body);
        res.status(200).json(await getMessages(1, recipientId, oldestId, greater === "true") as any)
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}