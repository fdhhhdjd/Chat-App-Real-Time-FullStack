const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: ".env" });
const connectDB = require("./configs/db");
const socket = require("socket.io");
connectDB();
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: ".env" });
}
app.get("/tai", (req, res) => {
  return res.status(200).json({
    status: "200",
    message: "WellCome To Tai Heo ",
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`server is listening on port:http://localhost:${PORT}`)
);
const io = socket(server, {
  cors: {
    origin: process.env.FRONT_END,
    credentials: true,
  },
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
