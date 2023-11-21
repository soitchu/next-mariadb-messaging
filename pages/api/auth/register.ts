import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, init } from "../../../api";
import { hashPassword } from "../../../Components/helper";

type ResponseData = { [key: string]: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { username, password } = JSON.parse(req.body);
    const hashedPassword = await hashPassword(password);

    await init();
    await addUser(username, hashedPassword);

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.toString() });
  }
}
