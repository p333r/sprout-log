const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");

class User {
  constructor(username, passwordHash, jars, role) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.jars = jars;
    this.role = role;
  }
  async save() {
    await users.set(this.username, {
      passwordHash: this.passwordHash,
      jars: this.jars,
      role: this.role,
    });
  }

  async delete() {
    users.delete(this.username);
  }

  // Get user from database and update props of user instance
  async get() {
    const { passwordHash, jars, role } = await users
      .get(this.username)
      .then((user) => user.props);

    this.passwordHash = passwordHash;
    this.jars = jars;
    this.role = role;
  }
}

module.exports = User;
