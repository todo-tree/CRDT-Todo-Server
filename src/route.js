import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello!!!!!!!" });
});

export default router;
