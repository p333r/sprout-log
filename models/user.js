const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");

class User {
  constructor(username, passwordHash, jars, role) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.jars = jars;
    this.role = role;
    this.updated = "";
    this.created = "";
    this.postRequests = 0;
  }
  async save() {
    await users.set(this.username, {
      passwordHash: this.passwordHash,
      jars: this.jars,
      role: this.role,
      postRequests: this.postRequests,
    });
  }

  async delete() {
    users.delete(this.username);
  }

  // Get user from database and update props of user instance
  async get() {
    const { passwordHash, jars, role, updated, created, postRequests } =
      await users.get(this.username).then((user) => user.props);

    this.passwordHash = passwordHash;
    this.jars = jars;
    this.role = role;
    this.updated = updated;
    this.created = created;
    this.postRequests = postRequests || 0;
  }
}

module.exports = User;
