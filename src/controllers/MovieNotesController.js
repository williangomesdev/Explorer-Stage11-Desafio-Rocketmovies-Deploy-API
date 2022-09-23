const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class MovieNotesController {
  async createMovieNotes(request, response) {
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;

    if (!title) {
      throw new AppError("Título do filme é obrigatório!");
    }
    if (!description) {
      throw new AppError("Descrição do filme é obrigatório!");
    }
    if (!rating) {
      throw new AppError("Nota do filme é obrigatório!");
    } else if (rating > 5) {
      throw new AppError("Nota inválida, por favor insira notas entre 1 e 5!");
    }

    const movie_id = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        movie_id,
        name,
        user_id,
      };
    });

    await knex("movie_tags").insert(tagsInsert);

    return response.json();
  }

  async showMovieNotes(request, response) {
    const { id } = request.params;

    const noteMovie = await knex("movie_notes").where({ id }).first();
    const tagMovie = await knex("movie_tags")
      .where({ movie_id: id })
      .orderBy("name");

    return response.json({
      ...noteMovie,
      tagMovie,
    });
  }

  async deleteMovieNotes(request, response) {
    const { id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.json();
  }

  async indexMovie(request, response) {
    const { title, tags } = request.query;

    const user_id = request.user.id;
    let notesUser;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      notesUser = await knex("movie_tags")
        .select(["movie_notes.id", "movie_notes.title", "movie_notes.user_id"])
        .where("movie_notes.id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.movie_id")
        .orderBy("movie_notes.title");
    } else {
      notesUser = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({ user_id });
    const movieNotesWithTags = notesUser.map((movie) => {
      const movieTags = userTags.filter((tag) => tag.movie_id === movie.id);

      return {
        ...movie,
        tags: movieTags,
      };
    });

    return response.json(movieNotesWithTags);
  }
}

module.exports = MovieNotesController;
