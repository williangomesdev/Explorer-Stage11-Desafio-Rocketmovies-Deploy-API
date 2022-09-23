const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
let hashedPassword;
class UsersController {
  async createUser(request, response) {
    const { name, email, password, avatar } = request.body;
    const searchName = await knex("users").select("name");
    const searchEmail = await knex("users").select("email");
    const nameAlreadyExists = searchName.filter((el) => el.name == name).length;
    const emailAlreadyExists = searchEmail.filter(
      (el) => el.email == email
    ).length;

    if (!name) {
      throw new AppError("Nome é obrigatório!");
    } else if (!email) {
      throw new AppError("Email é obrigatório!");
    } else if (!password) {
      throw new AppError("Senha é obrigatória!");
    } else if (emailAlreadyExists > 0) {
      throw new AppError(
        "E-mail ja está em uso. favor adicionar outro endereço de e-mail "
      );
    } else if (nameAlreadyExists > 0) {
      throw new AppError(
        "Nome de usuário ja está em uso por outro perfil, favor adicionar outro nome "
      );
    }

    hashedPassword = await hash(password, 8);

    await knex("users").insert({
      name,
      email,
      password: hashedPassword,
    });

    return response.json();
  }

  async updateUser(request, response) {
    const { name, email, password, old_password } = request.body;

    const user_id = request.user.id;
    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);


    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email =(?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso!");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha!"
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("Senha antiga incorreta");
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `UPDATE users SET name = ?, email = ?,password =?, updated_at = DATETIME('now') WHERE id =?`,
      [user.name, user.email, user.password, user_id]
    );

    return response.json();
  }
}

module.exports = UsersController;
