import mongoose from "mongoose";

const TaskType = new mongoose.Schema({
  _uid: String,
  title: String,
  done: Boolean,
  _createdAt: Number,
  _updatedAt: Number,
  _hash: String,
  _rev: Number,
  _deleted: Boolean,
  _v: Number,
});

const deletedTaskType = new mongoose.Schema({
  _uid: String,
  _updatedAt: Number,
});

export const Task = mongoose.model("Task", TaskType);
export const DeleteTask = mongoose.model("DeleteTask", deletedTaskType);
