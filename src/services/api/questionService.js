import mockQuestions from "@/services/mockData/questions.json";

class QuestionService {
  constructor() {
    this.questions = [...mockQuestions];
    this.nextId = Math.max(...this.questions.map(q => q.Id)) + 1;
  }

  // Simulate network delay
  delay = () => new Promise(resolve => setTimeout(resolve, 500));

  async getAll() {
    await this.delay();
    return [...this.questions];
  }

  async getById(id) {
    await this.delay();
    const question = this.questions.find(q => q.Id === parseInt(id));
    if (!question) {
      throw new Error(`Question with Id ${id} not found`);
    }
    return { ...question };
  }

  async create(questionData) {
    await this.delay();
    
    // Validate required fields
    if (!questionData.label || !questionData.type) {
      throw new Error('Label and type are required');
    }

    // Auto-generate Id and set defaults
    const newQuestion = {
      Id: this.nextId++,
      label: questionData.label,
      type: questionData.type,
      options: questionData.options || null,
      display_order: questionData.display_order || this.questions.length + 1,
      is_active: questionData.is_active !== undefined ? questionData.is_active : true,
      logic_json: questionData.logic_json || null
    };

    this.questions.push(newQuestion);
    return { ...newQuestion };
  }

  async update(id, updateData) {
    await this.delay();
    
    const index = this.questions.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Question with Id ${id} not found`);
    }

    // Prevent updating Id field
    const { Id, ...allowedUpdates } = updateData;
    
    this.questions[index] = {
      ...this.questions[index],
      ...allowedUpdates
    };

    return { ...this.questions[index] };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.questions.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Question with Id ${id} not found`);
    }

    // Check if question has been used in answers (mock check)
    const hasAnswers = Math.random() > 0.7; // Simulate some questions having answers
    if (hasAnswers) {
      throw new Error('Cannot delete question that has existing answers. Archive it instead.');
    }

    this.questions.splice(index, 1);
    return true;
  }

  async archive(id) {
    await this.delay();
    return this.update(id, { is_active: false });
  }

  async activate(id) {
    await this.delay();
    return this.update(id, { is_active: true });
  }

  async reorder(questionsWithNewOrder) {
    await this.delay();
    
    for (const question of questionsWithNewOrder) {
      const index = this.questions.findIndex(q => q.Id === question.Id);
      if (index !== -1) {
        this.questions[index].display_order = question.display_order;
      }
    }

    return [...this.questions];
  }

  async getActive() {
    await this.delay();
    return this.questions
      .filter(q => q.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  async getArchived() {
    await this.delay();
    return this.questions
      .filter(q => !q.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  // Helper method to validate question type and options
  validateQuestion(questionData) {
    const validTypes = ['radio', 'scale', 'text', 'time', 'number', 'multi'];
    
    if (!validTypes.includes(questionData.type)) {
      throw new Error(`Invalid question type: ${questionData.type}`);
    }

    if (questionData.type === 'radio' && (!questionData.options || !Array.isArray(questionData.options))) {
      throw new Error('Radio questions must have options array');
    }

    if (questionData.type === 'multi' && (!questionData.options || !Array.isArray(questionData.options))) {
      throw new Error('Multi-select questions must have options array');
    }

    return true;
  }

  // Helper to check if question has existing answers
  async hasAnswers(id) {
    await this.delay();
    // Mock implementation - in real app this would check diary_answers table
    return Math.random() > 0.6; // Simulate some questions having answers
  }
}

export const questionService = new QuestionService();