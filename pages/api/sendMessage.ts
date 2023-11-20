import type { NextApiRequest, NextApiResponse } from "next";
import { sendMessage } from "../../api";

type ResponseData = {
    message: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { recipientId, message } = JSON.parse(req.body);

        // console.log(recipientId, message)
        sendMessage(recipientId, 1, message);

        res.status(200).json({ message: ":D" })
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}