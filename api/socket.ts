import { getUserIdByCookie } from "../Components/helper";
import { Server } from "socket.io";
import Cookie from "cookie";

export let io: Server;
console.log("====== :DD");

export function editMessageEvent(userId: number, content: string, messageId: number) {
  console.log(io);
  // io.in(`user-${userId}`).emit("editMessage", {
  //   content,
  //   messageId
  // });
}

export function init(server: any) {
  io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false
  });

  io.on("connection", async (socket) => {
    try {
      const cookies = Cookie.parse(socket.request.headers.cookie);
      const userId = await getUserIdByCookie(cookies["X-Auth-Token"]);
      console.log(userId);
      // console.log(socket.)
      // const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
      // socket.join(`user-${userId}`);
    } catch (err) {
      socket.disconnect();
      console.error(err);
    }
  });
}
