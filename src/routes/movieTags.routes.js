const { Router } = require("express");
const MovieTagsController = require("../controllers/MovieTagsController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const movieTagsRoutes = Router();

const movieTagsController = new MovieTagsController();

movieTagsRoutes.get("/",ensureAuthenticated, movieTagsController.indexTags);

module.exports = movieTagsRoutes;
