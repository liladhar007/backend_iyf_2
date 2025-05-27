const db = require("../config/db");


// GET /api/facilitator-comments - Get comments for a student by facilitator
exports.getComments = async (req, res) => {
  const { facilitator_id, student_id } = req.query;

  if (!facilitator_id || !student_id) {
    return res.status(400).json({ message: 'facilitator_id and student_id are required' });
  }

  const query = `
    SELECT comment_data, last_updated 
    FROM facilitator_student_comments 
    WHERE facilitator_id = ? AND student_id = ?
  `;

  db.query(query, [facilitator_id, student_id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(200).json({ comment_data: [], last_updated: null });
    }

    try {
      const commentData = typeof results[0].comment_data === 'string' 
        ? JSON.parse(results[0].comment_data) 
        : results[0].comment_data;
      
      res.status(200).json({
        comment_data: commentData,
        last_updated: results[0].last_updated
      });
    } catch (parseErr) {
      console.error('Error parsing comment data:', parseErr);
      res.status(500).json({ message: 'Error processing comment data' });
    }
  });
};


// PUT /api/facilitator-comments/append - Append a new comment to existing comments
exports.appendComment = async (req, res) => {
  const { facilitator_id, student_id, date, comment } = req.body;

  if (!facilitator_id || !student_id || !date || !comment) {
    return res.status(400).json({ 
      message: 'facilitator_id, student_id, date, and comment are required' 
    });
  }

  const newComment = { date, comment };
  
  // First get existing comments
  const getQuery = `
    SELECT comment_data 
    FROM facilitator_student_comments 
    WHERE facilitator_id = ? AND student_id = ?
    FOR UPDATE
  `;

  db.query(getQuery, [facilitator_id, student_id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    let comments = [];
    if (results.length > 0) {
      try {
        comments = typeof results[0].comment_data === 'string' 
          ? JSON.parse(results[0].comment_data) 
          : results[0].comment_data;
      } catch (parseErr) {
        console.error('Error parsing existing comments:', parseErr);
        return res.status(500).json({ message: 'Error processing existing comments' });
      }
    }

    // Add new comment to beginning of array
    comments.unshift(newComment);

    // Update with new comments array
    const updateQuery = `
      INSERT INTO facilitator_student_comments 
      (facilitator_id, student_id, comment_data) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      comment_data = VALUES(comment_data),
      last_updated = CURRENT_TIMESTAMP
    `;

    db.query(updateQuery, [facilitator_id, student_id, JSON.stringify(comments)], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating comments:', updateErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json({ 
        message: 'Comment appended successfully',
        affectedRows: updateResult.affectedRows 
      });
    });
  });
};


// DELETE /api/facilitator-comments - Delete all comments for a student by facilitator
exports.deleteComments = async (req, res) => {
  const { facilitator_id, student_id } = req.body;

  if (!facilitator_id || !student_id) {
    return res.status(400).json({ message: 'facilitator_id and student_id are required' });
  }

  const query = `
    DELETE FROM facilitator_student_comments 
    WHERE facilitator_id = ? AND student_id = ?
  `;

  db.query(query, [facilitator_id, student_id], (err, result) => {
    if (err) {
      console.error('Error deleting comments:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({ 
      message: 'Comments deleted successfully',
      affectedRows: result.affectedRows 
    });
  });
};