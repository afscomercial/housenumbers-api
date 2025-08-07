export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly hashedPassword: string,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(id: string, username: string, hashedPassword: string): User {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }
    
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new Error('Hashed password is required');
    }

    return new User(id, username.trim(), hashedPassword);
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt
    };
  }
}