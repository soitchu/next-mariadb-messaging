import { initSocket } from "../../../api";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Server is already running");
    res.end();
    return;
  } else {
    initSocket(res.socket.server);
  }
}
