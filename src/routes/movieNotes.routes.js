const { Router } = require("express");
const MovieNotesController = require("../controllers/MovieNotesController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const movieNotesRoutes = Router();

const movieNotesController = new MovieNotesController();

movieNotesRoutes.use(ensureAuthenticated);

movieNotesRoutes.post("/", movieNotesController.createMovieNotes);
movieNotesRoutes.get("/:id", movieNotesController.showMovieNotes);
movieNotesRoutes.delete("/:id", movieNotesController.deleteMovieNotes);
movieNotesRoutes.get("/", movieNotesController.indexMovie);

module.exports = movieNotesRoutes;
