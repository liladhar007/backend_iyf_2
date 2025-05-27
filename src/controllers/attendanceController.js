const db = require("../config/db");

exports.markAttendance = (req, res) => {
  let { AttendanceSession, StudentId } = req.body;

  if (!AttendanceSession || !StudentId) {
    return res
      .status(400)
      .json({ message: "AttendanceSession and StudentId are required" });
  }

  // Step 1: Define shifting logic
  const groupShiftMap = {
    "DYS-1": "DYS-1",
    "DYS-2": "DYS-2",
    "DYS-3": "DYS-3",
    "DYS-4": "DYS-4",
    "DYS-5": "DYS-5",
    "DYS-6": "DYS-6",
  };

  let updatedSession;

  // Step 2: Decide updatedSession
  if (AttendanceSession === "new") {
    updatedSession = "DYS-1";
  } else {
    updatedSession = groupShiftMap[AttendanceSession] || AttendanceSession;
  }

  // Step 3: Insert into studentAttendance
  const attendanceQuery = `
    INSERT INTO studentAttendance (AttendanceDate, AttendanceSession, StudentId)
    VALUES (NOW(), ?, ?)
  `;

  db.query(attendanceQuery, [updatedSession, StudentId], (err, result) => {
    if (err) {
      console.error("Error inserting attendance:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Step 4: If it's a new user, assign DYS-1, batch, and facilitator
    if (AttendanceSession === "new") {
      const getBatchQuery = `
        SELECT BatchId, FacilitatorId
        FROM studentbatch
        WHERE is_start = 0
        LIMIT 1
      `;

      db.query(getBatchQuery, (batchErr, batchResults) => {
        if (batchErr) {
          console.error("Error fetching batch:", batchErr);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (batchResults.length === 0) {
          return res.status(404).json({ message: "No available batch found" });
        }

        const { BatchId, FacilitatorId } = batchResults[0];

        const updateUserQuery = `
          UPDATE users
          SET group_name = 'DYS-1',
              batch_id = ?,
              facilitatorId = ?
          WHERE user_id = ?
        `;

        db.query(
          updateUserQuery,
          [BatchId, FacilitatorId, StudentId],
          (updateErr) => {
            if (updateErr) {
              console.error("Error updating user data:", updateErr);
              return res.status(500).json({ message: "Internal server error" });
            }

            return res.status(201).json({
              message:
                "Attendance marked, new user group set to DYS-1, batch/facilitator assigned",
              AttendanceId: result.insertId,
              BatchId,
              FacilitatorId,
            });
          }
        );
      });
    } else {
      // Step 5: For existing users, update group_name as per session map
      const updateUserGroupQuery = `
        UPDATE users
        SET group_name = ?
        WHERE user_id = ?
      `;

      db.query(
        updateUserGroupQuery,
        [updatedSession, StudentId],
        (groupErr) => {
          if (groupErr) {
            console.error("Error updating user group:", groupErr);
            return res
              .status(500)
              .json({ message: "Failed to update user group." });
          }

          return res.status(201).json({
            message: "Attendance marked and user group updated",
            AttendanceId: result.insertId,
            UsedSession: updatedSession,
          });
        }
      );
    }
  });
};
// exports.markAttendance = (req, res) => {
//   let { AttendanceSession, StudentId } = req.body;

//   if (!AttendanceSession || !StudentId) {
//     return res
//       .status(400)
//       .json({ message: "AttendanceSession and StudentId are required" });
//   }

//   // Step 1: Define shifting logic
//   const groupShiftMap = {
//     "DYS-1": "DYS-2",
//     "DYS-2": "DYS-3",
//     "DYS-3": "DYS-4",
//     "DYS-4": "DYS-5",
//     "DYS-5": "DYS-6",
//   };

//   let updatedSession;

//   // Step 2: Decide updatedSession
//   if (AttendanceSession === "new") {
//     updatedSession = "DYS-1";
//   } else {
//     updatedSession = groupShiftMap[AttendanceSession] || AttendanceSession;
//   }

//   // Step 3: Insert into studentAttendance
//   const attendanceQuery = `
//     INSERT INTO studentAttendance (AttendanceDate, AttendanceSession, StudentId)
//     VALUES (NOW(), ?, ?)
//   `;

//   db.query(attendanceQuery, [updatedSession, StudentId], (err, result) => {
//     if (err) {
//       console.error("Error inserting attendance:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     // Step 4: If it's a new user, assign DYS-1, batch, and facilitator
//     if (AttendanceSession === "new") {
//       const getBatchQuery = `
//         SELECT BatchId, FacilitatorId
//         FROM studentbatch
//         WHERE is_start = 0
//         LIMIT 1
//       `;

//       db.query(getBatchQuery, (batchErr, batchResults) => {
//         if (batchErr) {
//           console.error("Error fetching batch:", batchErr);
//           return res.status(500).json({ message: "Internal server error" });
//         }

//         if (batchResults.length === 0) {
//           return res.status(404).json({ message: "No available batch found" });
//         }

//         const { BatchId, FacilitatorId } = batchResults[0];

//         const updateUserQuery = `
//           UPDATE users
//           SET group_name = 'DYS-1',
//               batch_id = ?,
//               facilitatorId = ?
//           WHERE user_id = ?
//         `;

//         db.query(
//           updateUserQuery,
//           [BatchId, FacilitatorId, StudentId],
//           (updateErr) => {
//             if (updateErr) {
//               console.error("Error updating user data:", updateErr);
//               return res.status(500).json({ message: "Internal server error" });
//             }

//             return res.status(201).json({
//               message:
//                 "Attendance marked, new user group set to DYS-1, batch/facilitator assigned",
//               AttendanceId: result.insertId,
//               BatchId,
//               FacilitatorId,
//             });
//           }
//         );
//       });
//     } else {
//       // Step 5: For existing users, update group_name as per session map
//       const updateUserGroupQuery = `
//         UPDATE users
//         SET group_name = ?
//         WHERE user_id = ?
//       `;

//       db.query(
//         updateUserGroupQuery,
//         [updatedSession, StudentId],
//         (groupErr) => {
//           if (groupErr) {
//             console.error("Error updating user group:", groupErr);
//             return res
//               .status(500)
//               .json({ message: "Failed to update user group." });
//           }

//           return res.status(201).json({
//             message: "Attendance marked and user group updated",
//             AttendanceId: result.insertId,
//             UsedSession: updatedSession,
//           });
//         }
//       );
//     }
//   });
// };

exports.updateStudentGroupWise = (req, res) => {
  const { user_id, newGroupName } = req.body;

  if (!user_id || !newGroupName) {
    return res
      .status(400)
      .json({ message: "userId and newGroupName are required" });
  }

  const query = `
    UPDATE users
    SET group_name = ?
    WHERE user_id = ?
  `;

  db.query(query, [newGroupName, user_id], (err, results) => {
    if (err) {
      console.error("Error updating group name:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Group name updated successfully" });
  });
};

// exports.getStudentGroupWise = (req, res) => {
//   const { facilitatorId, groupname } = req.body;

//   if (!facilitatorId || !groupname) {
//     return res.status(400).json({ message: 'facilitatorId and groupname are required' });
//   }

//   const query = `SELECT *
//     FROM users
//     WHERE facilitatorId = ?
//     AND group_name LIKE ? `;

//     // console.log(query)

//   // Append '%' to the groupname to match all groups starting with the provided value.
//   const groupSearch = groupname + '%';

//   // console.log(groupSearch)

//   db.query(query, [facilitatorId, groupSearch], (err, results) => {
//     if (err) {
//       console.error("Error fetching users by frontliner_id:", err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }

//     return res.status(200).json({ users: results });
//   });
// };

// exports.getFrontlinerdetailReport = (req, res) => {
//   const { facilitatorId, group_name } = req.body;

//   if (!facilitatorId || !group_name) {
//     return res
//       .status(400)
//       .json({ message: "facilitatorId and groupname are required" });
//   }

//   db.query(
//     "CALL progressReportGroupWise(?, ?)",
//     [facilitatorId, group_name],
//     (err, results) => {
//       if (err) {
//         console.error("Error calling progressReportGroupWise:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json(results[0]);
//     }
//   );
// };


exports.getFrontlinerdetailReport = (req, res) => {
  const {
    facilitatorId,
    groupPrefix,
    sessionName,
    selectedYear,
    selectedMonth,
  } = req.body;

  // only these three are truly required
  if (!facilitatorId || !groupPrefix || !sessionName) {
    return res
      .status(400)
      .json({ message: "facilitatorId, groupPrefix & sessionName are required" });
  }

  // if year/month are missing (undefined/null/empty), pass null to the SP
  const yearParam  = selectedYear != null && selectedYear !== "" ? selectedYear : null;
  const monthParam = selectedMonth != null && selectedMonth !== "" ? selectedMonth : null;

  db.query(
    "CALL progressReportGroupWise(?, ?, ?, ?, ?)",
    [sessionName, yearParam, monthParam, facilitatorId, groupPrefix],
    (err, results) => {
      if (err) {
        console.error("Error calling progressReportGroupWise:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results[0]);
    }
  );
};


exports.getStudentClassReport = (req, res) => {
  const { user_id } = req.body; // ✅ reading from body now

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required in body" });
  }

  db.query("CALL studentClassReport(?)", [user_id], (err, results) => {
    if (err) {
      console.error("Error executing procedure:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
};

exports.getStudentReport = (req, res) => {
  const { groupName, month, year } = req.body;

  const getStudentReportQuery = `
    WITH
      -- 1) all class dates in the given month/year for the specified session
      class_dates AS (
        SELECT DISTINCT
          DATE(sa.AttendanceDate) AS class_date
        FROM studentAttendance sa
        WHERE sa.AttendanceSession = ?
          AND MONTH(sa.AttendanceDate) = ?
          AND YEAR(sa.AttendanceDate) = ?
      ),

      -- 2) all facilitators in that group + their total student count
      facilitators AS (
        SELECT
          u.facilitatorId,
          ida.name         AS facilitator_name,
          ida.phone_number,
          COUNT(*)         AS total_students
        FROM users u
        JOIN iyfdashboardAccounts ida
          ON u.facilitatorId = ida.user_id
        WHERE u.group_name = ?
        GROUP BY
          u.facilitatorId,
          ida.name,
          ida.phone_number
      ),

      -- 3) raw attendance counts per facilitator × date
      attendance_raw AS (
        SELECT
          u.facilitatorId,
          DATE(sa.AttendanceDate) AS class_date,
          COUNT(DISTINCT sa.StudentId) AS attendance_count
        FROM users u
        JOIN studentAttendance sa
          ON u.user_id = sa.StudentId
        LEFT JOIN group_migration gm
          ON gm.devoteeId    = u.user_id
         AND gm.priviousGroup = ?
        WHERE u.group_name = ?
          AND MONTH(sa.AttendanceDate) = ?
          AND YEAR(sa.AttendanceDate) = ?
          AND (gm.migrationDateTime IS NULL
               OR sa.AttendanceDate < gm.migrationDateTime)
        GROUP BY
          u.facilitatorId,
          DATE(sa.AttendanceDate)
      )

    -- 4) build the full facilitator × date grid, fill missing with zero
    SELECT
      f.facilitatorId,
      f.facilitator_name,
      f.phone_number,
      cd.class_date,
      COALESCE(ar.attendance_count, 0) AS attendance_count,
      f.total_students,
      CONCAT(
        COALESCE(ar.attendance_count, 0),
        '/',
        f.total_students
      ) AS attendance_ratio
    FROM facilitators f
    CROSS JOIN class_dates cd
    LEFT JOIN attendance_raw ar
      ON ar.facilitatorId = f.facilitatorId
     AND ar.class_date     = cd.class_date
    ORDER BY
      cd.class_date,
      f.facilitatorId;
  `;

  // parameters: [session, month, year, groupName, groupName, groupName, month, year]
  db.query(
    getStudentReportQuery,
    [groupName, month, year, groupName, groupName, groupName, month, year],
    (err, result) => {
      if (err) {
        console.error("Error fetching student report:", err);
        return res
          .status(500)
          .json({ error: "Error fetching student report", details: err });
      }

      // even if result is empty, we still return an empty array instead of 404:
      const groupedData = {};
      result.forEach((row) => {
        if (!groupedData[row.facilitatorId]) {
          groupedData[row.facilitatorId] = {
            facilitatorId: row.facilitatorId,
            facilitator_name: row.facilitator_name,
            phone_number: row.phone_number,
            report: [],
          };
        }
        groupedData[row.facilitatorId].report.push({
          class_date: row.class_date,
          attendance_count: row.attendance_count,
          total_students: row.total_students,
          attendance_ratio: row.attendance_ratio,
        });
      });

      const finalResponse = Object.values(groupedData);

      res.status(200).json({
        message: "Student report fetched successfully",
        data: finalResponse,
      });
    }
  );
};


exports.getStudentAttendanceSessions = (req, res) => {
  const { studentId } = req.params;

  // Validate studentId is a number
  if (isNaN(studentId)) {
    return res.status(400).json({ 
      error: "Invalid student ID",
      message: "Student ID must be a number" 
    });
  }

  const query = `
    SELECT DISTINCT AttendanceSession
    FROM studentAttendance
    WHERE StudentId = ?
    ORDER BY AttendanceSession
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "Database error",
        details: err.message 
      });
    }

    // Extract just the session names into an array
    const sessions = results.map(row => row.AttendanceSession);

    res.status(200).json({
      studentId: parseInt(studentId),
      attendanceSessions: sessions
    });
  });
};