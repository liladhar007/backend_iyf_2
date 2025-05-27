const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createOrUpdateComments, getComments, appendComment, deleteComments } = require("../controllers/StudentCommentsController");
const router = express.Router();


// Get comments
router.get("/facilitator-comments", authMiddleware, getComments);

// Append new comment
router.put("/facilitator-comments/append", authMiddleware, appendComment);

// Delete comments
router.delete("/facilitator-comments", authMiddleware, deleteComments);

module.exports = router;
