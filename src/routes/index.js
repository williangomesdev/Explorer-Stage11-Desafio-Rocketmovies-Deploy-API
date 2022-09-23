const { Router } = require("express");

const usersRoutes = require("./user.routes");
const moviesRoutes = require("./movieNotes.routes");
const tagsRoutes = require("./movieTags.routes");
const sessionRoutes = require("./sessions.routes")

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionRoutes);
routes.use("/notes", moviesRoutes);
routes.use("/tags", tagsRoutes);

module.exports = routes;
