import type { NextApiRequest, NextApiResponse } from "next";
import { sendMessage } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { recipientId, message } = JSON.parse(req.body);
        const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);

        console.log("================", userId, req.cookies)
        await sendMessage(recipientId, Number(userId), message);

        res.status(200).json({ message: ":D" })
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}