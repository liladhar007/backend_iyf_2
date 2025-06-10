    const express = require("express");
    const bodyParser = require("body-parser");
    const cors = require("cors");
    const authRoutes = require("./src/routes/authRoutes");
    const studentFormRoutes = require("./src/routes/studentFormRoutes");
    const dashboardRoutes = require("./src/routes/dashboardRoutes");
    const batchRoutes = require("./src/routes/batchRoutes");
    const attendanceRoutes = require("./src/routes/attendanceRoutes");
    const migrationRoutes = require("./src/routes/migrationRoutes");
    const taskRoutes = require("./src/routes/taskRoutes");
    const StudentCommentsRoutes = require("./src/routes/StudentCommentsRoutes");
    const eventsRoutes = require("./src/routes/eventRoutes");
    const db = require("./src/config/db");



    console.log('hi there! wlc to  IYF_Dashboard');

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.json({ limit: '2gb' }));
    app.use(express.urlencoded({ limit: '2gb', extended: true }));



    app.use("/auth", authRoutes);
    app.use("/students", studentFormRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/batch", batchRoutes);
    app.use("/attendance", attendanceRoutes);
    app.use("/groupMigration", migrationRoutes);
    app.use("/task", taskRoutes);
    app.use("/comments",StudentCommentsRoutes);
    app.use("/event",eventsRoutes);


    app.get('/', (req, res) => {
        res.send('Hello from Node API Server IYF_Dashboard Updated');
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
