const OpenAIService = require('./openaiService');
const GeminiService = require('./geminiService');

class AIService {
  constructor() {
    this.openai = new OpenAIService();
    this.gemini = new GeminiService();
  }

  /**
   * Analyze resume content using AI
   * @param {string} resumeText - The resume text to analyze
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Structured resume data
   */
  async analyzeResume(resumeText, provider = 'gemini') {
    try {
      if (provider === 'openai') {
        return await this.openai.analyzeResume(resumeText);
      } else {
        return await this.gemini.analyzeResume(resumeText);
      }
    } catch (error) {
      console.error(`Resume analysis failed with ${provider}:`, error);
      // Fallback to other provider
      const fallbackProvider = provider === 'openai' ? 'gemini' : 'openai';
      console.log(`Trying fallback provider: ${fallbackProvider}`);
      
      if (fallbackProvider === 'openai') {
        return await this.openai.analyzeResume(resumeText);
      } else {
        return await this.gemini.analyzeResume(resumeText);
      }
    }
  }

  /**
   * Match student profile with internship requirements
   * @param {Object} studentProfile - Student's profile data
   * @param {Object} internshipDetails - Internship requirements
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Matching analysis and score
   */
  async matchProfileToInternship(studentProfile, internshipDetails, provider = 'openai') {
    try {
      if (provider === 'openai') {
        return await this.openai.matchProfileToInternship(studentProfile, internshipDetails);
      } else {
        return await this.gemini.matchProfileToInternship(studentProfile, internshipDetails);
      }
    } catch (error) {
      console.error(`Profile matching failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Generate interview questions based on role and skills
   * @param {Object} jobRole - Job role details
   * @param {Array} skills - Required skills
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Array} Array of interview questions
   */
  async generateInterviewQuestions(jobRole, skills, provider = 'openai') {
    try {
      if (provider === 'openai') {
        return await this.openai.generateInterviewQuestions(jobRole, skills);
      } else {
        return await this.gemini.generateInterviewQuestions(jobRole, skills);
      }
    } catch (error) {
      console.error(`Interview question generation failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Enhance application content with AI suggestions
   * @param {string} content - Original content (cover letter, etc.)
   * @param {string} jobDescription - Target job description
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Enhanced content and suggestions
   */
  async enhanceApplicationContent(content, jobDescription, provider = 'openai') {
    try {
      if (provider === 'openai') {
        return await this.openai.enhanceApplicationContent(content, jobDescription);
      } else {
        return await this.gemini.enhanceApplicationContent(content, jobDescription);
      }
    } catch (error) {
      console.error(`Content enhancement failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Analyze skills gap and provide recommendations
   * @param {Array} currentSkills - Student's current skills
   * @param {Array} requiredSkills - Skills required for target roles
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Skills gap analysis and recommendations
   */
  async analyzeSkillsGap(currentSkills, requiredSkills, provider = 'gemini') {
    try {
      if (provider === 'openai') {
        return await this.openai.analyzeSkillsGap(currentSkills, requiredSkills);
      } else {
        return await this.gemini.analyzeSkillsGap(currentSkills, requiredSkills);
      }
    } catch (error) {
      console.error(`Skills gap analysis failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Generate career guidance based on student profile
   * @param {Object} studentProfile - Student's complete profile
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Career guidance and recommendations
   */
  async generateCareerGuidance(studentProfile, provider = 'openai') {
    try {
      if (provider === 'openai') {
        return await this.openai.generateCareerGuidance(studentProfile);
      } else {
        return await this.gemini.generateCareerGuidance(studentProfile);
      }
    } catch (error) {
      console.error(`Career guidance generation failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Predict placement success rate
   * @param {Object} studentData - Historical and current student data
   * @param {Object} marketTrends - Current job market trends
   * @param {string} provider - AI provider ('openai' or 'gemini')
   * @returns {Object} Placement prediction and factors
   */
  async predictPlacementSuccess(studentData, marketTrends, provider = 'gemini') {
    try {
      if (provider === 'openai') {
        return await this.openai.predictPlacementSuccess(studentData, marketTrends);
      } else {
        return await this.gemini.predictPlacementSuccess(studentData, marketTrends);
      }
    } catch (error) {
      console.error(`Placement prediction failed with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get health status of AI services
   * @returns {Object} Health status of both providers
   */
  async getServiceHealth() {
    const health = {
      openai: { status: 'unknown', error: null },
      gemini: { status: 'unknown', error: null }
    };

    try {
      await this.openai.testConnection();
      health.openai.status = 'healthy';
    } catch (error) {
      health.openai.status = 'error';
      health.openai.error = error.message;
    }

    try {
      await this.gemini.testConnection();
      health.gemini.status = 'healthy';
    } catch (error) {
      health.gemini.status = 'error';
      health.gemini.error = error.message;
    }

    return health;
  }
}

module.exports = AIService;