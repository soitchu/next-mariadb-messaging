import type { NextApiRequest, NextApiResponse } from "next";
import { addSession, getUserInfo } from "../../../api";
import { comparePassword, genSessionToken, hashPassword } from "../../../Components/helper";

type ResponseData = { [key: string]: any };

// 30 days
const expireOffset = 30 * 24 * 60 * 60 * 1000;

function getExpiryDate() {
    return (new Date(Date.now() + expireOffset)).toUTCString();
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { username, password } = JSON.parse(req.body);
        const [hashedPassword, userId] = await getUserInfo(username);
        const passwordCheck = await comparePassword(hashedPassword.toString(), password) === true;

        if (passwordCheck !== true) {
            res.status(200).json({ message: "Incorrect username/password" });
        }

        const [token, signedCookie] = await genSessionToken();

        await addSession(userId, req.headers["user-agent"] ?? "Unknown", token);

        res.setHeader("set-cookie", `X-Auth-Token=${signedCookie}; HttpOnly;Expires=${getExpiryDate()};Path=/`);
        res.status(200).json({ message: `:D` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.toString() })
    }
}