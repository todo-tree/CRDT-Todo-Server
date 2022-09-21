import express from "express";
import { DeleteTask, Task } from "./schema";
import { bodyValidate, CU_taskValidate, taskValidate } from "./validaitor";

const router = express.Router();

router.get("/get", async (req, res) => {
  const lastUpdate = req.query.lastUpdate
    ? parseInt(req.query.lastUpdate, 10)
    : 0;
  const keys = await Task.aggregate([
    {
      $match: { _updatedAt: { $gt: lastUpdate } },
    },
    {
      $group: {
        _id: "$_uid",
        _v: { $max: "$_v" },
      },
    },
  ]);

  keys.map((val, index) => {
    keys[index]._uid = val._id;
    delete keys[index]._id;
  });

  const cu_task = await Task.find(keys.length === 0 ? {} : { $or: keys }).sort(
    "_updatedAt"
  );
  const d_task = await DeleteTask.find({ _updatedAt: { $gt: lastUpdate } });

  return res
    .status(200)
    .json({ CU: cu_task, D: d_task, lastUpdate: lastUpdate });
});

router.post("/", async (req, res) => {
  const errorTasks = [];
  const sucsessTasks = [];

  const bodyValid = bodyValidate(req.body);

  if (!bodyValid) {
    return res.status(400).json({ errors: bodyValidate.errors });
  }

  req.body.datas?.map(async (val, index) => {
    const taskValid = taskValidate(val);
    if (!taskValid) {
      errorTasks.push(
        !req.body.error_messages
          ? val.sync_id
            ? val.sync_id
            : null
          : {
              id: val.sync_id ? val.sync_id : null,
              message: taskValidate.errors,
            }
      );
    } else {
      switch (val.type) {
        case "create":
        case "update":
          const CU_taskValid = CU_taskValidate(val);

          if (!CU_taskValid) {
            errorTasks.push(
              !req.body.error_messages
                ? val.sync_id
                  ? val.sync_id
                  : null
                : {
                    id: val.sync_id ? val.sync_id : null,
                    message: CU_taskValid.errors,
                  }
            );
          } else {
            let createTask = val;
            createTask._uid = val._id;
            delete createTask._id, createTask.sync_id, createTask.type;

            try {
              const newTask = new Task({
                ...createTask,
                _v: 10000000000000 * createTask._rev + createTask._updatedAt,
              });
              newTask.save();
              sucsessTasks.push(val.sync_id);

              const newestTask = await Task.find({ _uid: createTask._uid })
                .sort("_v")
                .limit(1);

              req.io.emit("CU_task", newestTask[0], req.body.clientId);
            } catch (e) {
              errorTasks.push(
                !req.body.error_messages
                  ? val.sync_id
                    ? val.sync_id
                    : null
                  : {
                      id: val.sync_id ? val.sync_id : null,
                    }
              );
            }
          }
          break;

        case "delete":
          sucsessTasks.push(val.sync_id);
          req.io.emit("D_task", val._id, req.body.clientId);
          await new DeleteTask({
            _uid: val._id,
            _updatedAt: Date.now(),
          }).save();
          await Task.deleteMany({ _uid: val._id });
      }
    }
  });

  if (req.body.datas.length > 1) {
    req.io.emit("N_sync");
  }

  return res.status(200).json({ sucsess: sucsessTasks, error: errorTasks });
});

export default router;
