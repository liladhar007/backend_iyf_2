const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createEvent, updateEvent, deleteEvent, deleteAllUserEvents, getUserEvents } = require('../controllers/eventController');

router.post('/events', authMiddleware,createEvent);
router.put('/events/:event_id', authMiddleware,updateEvent);
router.delete('/events/:event_id', authMiddleware,deleteEvent);
router.delete('/events/user/:user_id', authMiddleware,deleteAllUserEvents);
router.get('/events/user/:user_id', authMiddleware,getUserEvents);

module.exports = router;