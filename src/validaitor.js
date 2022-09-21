import Ajv from "ajv";
const ajv = new Ajv();

// need CU_TaskValidate, D_TaskValidate

const bodySchema = {
  required: ["datas", "error_messages"],
  type: "object",
  properties: {
    datas: {
      type: "array",
    },
    error_messages: {
      type: "boolean",
    },
  },
};

const CU_taskSchema = {
  required: [
    "sync_id",
    "_id",
    "_rev",
    "_deleted",
    "title",
    "done",
    "_createdAt",
    "_updatedAt",
    "_hash",
    "type",
  ],
  type: "object",
  properties: {
    type: {
      type: "string",
      pattern: "^(create|update)+$",
    },
    sync_id: { type: "string" },
    _id: { type: "string" },
    _rev: { type: "number" },
    _deleted: { type: "boolean" },
    title: { type: "string" },
    done: { type: "boolean" },
    _createdAt: { type: "number" },
    _updatedAt: { type: "number" },
    _hash: { type: "string" },
  },
};

const taskSchema = {
  required: ["sync_id", "_id", "type"],
  type: "object",
  properties: {
    type: {
      type: "string",
      pattern: "^(create|update|delete)+$",
    },
    sync_id: { type: "string" },
    _id: { type: "string" },
  },
};

export const bodyValidate = ajv.compile(bodySchema);
export const CU_taskValidate = ajv.compile(CU_taskSchema);
export const taskValidate = ajv.compile(taskSchema);
