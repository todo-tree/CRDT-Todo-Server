import mongoose from "mongoose";

const TaskType = new mongoose.Schema({});

export const Task = mongoose.model("Task", TaskType);
