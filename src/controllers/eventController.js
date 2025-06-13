// const db = require('../config/db'); // Adjust path to your MySQL connection

// // Create a new event
// exports.createEvent = (req, res) => {
//   const { user_id, title, start, end, description, reminder } = req.body;

//   if (!user_id || !title || !start || !end) {
//     return res.status(400).json({ message: 'User ID, title, start, and end are required' });
//   }

//   const eventId = Math.random().toString(36).substring(2); // Generate random ID (replace with UUID if preferred)
//   const createQuery = `
//     INSERT INTO event (event_id, user_id, title, start, end, description, reminder)
//     VALUES (?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(createQuery, [eventId, user_id, title, start, end, description, reminder], (err, results) => {
//     if (err) {
//       console.error('Error creating event:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     return res.status(201).json({
//       message: 'Event created successfully',
//       event: { event_id: eventId, user_id, title, start, end, description, reminder },
//     });
//   });
// };

// // Update an event
// exports.updateEvent = (req, res) => {
//   const { event_id } = req.params;
//   const { title, start, end, description, reminder } = req.body;

//   if (!event_id || !title || !start || !end) {
//     return res.status(400).json({ message: 'Event ID, title, start, and end are required' });
//   }

//   const updateQuery = `
//     UPDATE event 
//     SET title = ?, start = ?, end = ?, description = ?, reminder = ?
//     WHERE event_id = ?
//   `;

//   db.query(updateQuery, [title, start, end, description, reminder, event_id], (err, results) => {
//     if (err) {
//       console.error('Error updating event:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     return res.status(200).json({
//       message: 'Event updated successfully',
//       event: { event_id, title, start, end, description, reminder },
//     });
//   });
// };

// // Delete an event
// exports.deleteEvent = (req, res) => {
//   const { event_id } = req.params;

//   if (!event_id) {
//     return res.status(400).json({ message: 'Event ID is required' });
//   }

//   const deleteQuery = `
//     DELETE FROM event WHERE event_id = ?
//   `;

//   db.query(deleteQuery, [event_id], (err, results) => {
//     if (err) {
//       console.error('Error deleting event:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     return res.status(200).json({ message: 'Event deleted successfully' });
//   });
// };

// // Delete all events for a user
// exports.deleteAllUserEvents = (req, res) => {
//   const { user_id } = req.params;

//   if (!user_id) {
//     return res.status(400).json({ message: 'User ID is required' });
//   }

//   const deleteQuery = `
//     DELETE FROM event WHERE user_id = ?
//   `;

//   db.query(deleteQuery, [user_id], (err, results) => {
//     if (err) {
//       console.error('Error deleting user events:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     return res.status(200).json({
//       message: 'All user events deleted successfully',
//       deleted_count: results.affectedRows,
//     });
//   });
// };

// // Get all events for a user
// exports.getUserEvents = (req, res) => {
//   const { user_id } = req.params;

//   if (!user_id) {
//     return res.status(400).json({ message: 'User ID is required' });
//   }

//   const selectQuery = `
//     SELECT * FROM event WHERE user_id = ?
//   `;

//   db.query(selectQuery, [user_id], (err, results) => {
//     if (err) {
//       console.error('Error fetching events:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     return res.status(200).json({
//       message: 'Events fetched successfully',
//       events: results,
//     });
//   });
// };




const db = require('../config/db'); // Adjust path to your MySQL connection

// Create a new event
exports.createEvent = (req, res) => {
  const { user_id, title, start, end, description, reminder, recurring } = req.body;

  if (!user_id || !title || !start || !end) {
    return res.status(400).json({ message: 'User ID, title, start, and end are required' });
  }

  const eventId = Math.random().toString(36).substring(2); // Replace with UUID in production
  const createQuery = `
    INSERT INTO event (event_id, user_id, title, start, end, description, reminder, recurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(createQuery, [eventId, user_id, title, start, end, description, reminder, recurring || null], (err, results) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(201).json({
      message: 'Event created successfully',
      event: { event_id: eventId, user_id, title, start, end, description, reminder, recurring },
    });
  });
};

// Update an event
exports.updateEvent = (req, res) => {
  const { event_id } = req.params;
  const { title, start, end, description, reminder, recurring } = req.body;

  if (!event_id || !title || !start || !end) {
    return res.status(400).json({ message: 'Event ID, title, start, and end are required' });
  }

  const updateQuery = `
    UPDATE event 
    SET title = ?, start = ?, end = ?, description = ?, reminder = ?, recurring = ?
    WHERE event_id = ?
  `;

  db.query(updateQuery, [title, start, end, description, reminder, recurring || null, event_id], (err, results) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json({
      message: 'Event updated successfully',
      event: { event_id, title, start, end, description, reminder, recurring },
    });
  });
};

// Delete an event
exports.deleteEvent = (req, res) => {
  const { event_id } = req.params;

  if (!event_id) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  const deleteQuery = `
    DELETE FROM event WHERE event_id = ?
  `;

  db.query(deleteQuery, [event_id], (err, results) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event deleted successfully' });
  });
};

// Delete all events for a user
exports.deleteAllUserEvents = (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const deleteQuery = `
    DELETE FROM event WHERE user_id = ?
  `;

  db.query(deleteQuery, [user_id], (err, results) => {
    if (err) {
      console.error('Error deleting user events:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({
      message: 'All user events deleted successfully',
      deleted_count: results.affectedRows,
    });
  });
};

// Get all events for a user
exports.getUserEvents = (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const selectQuery = `
    SELECT * FROM event WHERE user_id = ?
  `;

  db.query(selectQuery, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({
      message: 'Events fetched successfully',
      events: results,
    });
  });
};
