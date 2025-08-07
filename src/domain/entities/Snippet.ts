export class Snippet {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly summary: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(id: string, text: string, summary: string): Snippet {
    if (!id || id.trim().length === 0) {
      throw new Error('Snippet ID is required');
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error('Snippet text is required');
    }
    
    if (!summary || summary.trim().length === 0) {
      throw new Error('Snippet summary is required');
    }

    return new Snippet(id, text.trim(), summary.trim());
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      summary: this.summary,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}