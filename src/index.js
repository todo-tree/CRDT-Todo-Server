import express from "express";
import socket from "socket.io";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import router from "./route";

const app = express();
const server = http.Server(app);
const io = socket(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 4000;

app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost/sync-db");

app.use("/", router);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`dev server running at: http://localhost:${PORT}/`);
});
