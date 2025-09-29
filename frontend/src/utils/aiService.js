import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * AI Service utilities for frontend
 * Provides functions to interact with AI backend APIs
 */

class AIService {
  constructor() {
    this.baseURL = '/api/ai';
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers object with Authorization if token exists
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }

  /**
   * Check AI services health
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('AI health check failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Analyze resume from text input
   */
  async analyzeResumeText(resumeText, provider = 'gemini') {
    try {
      const loadingToast = toast.loading('Analyzing resume with AI...');
      
      const response = await axios.post(`${this.baseURL}/analyze-resume-text`, {
        resumeText,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Resume analysis completed!');
      
      return response.data;
    } catch (error) {
      console.error('Resume text analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Analyze resume from uploaded file
   */
  async analyzeResumeFile(file, provider = 'gemini') {
    try {
      const loadingToast = toast.loading('Analyzing resume file with AI...');
      
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('provider', provider);
      
      const response = await axios.post(`${this.baseURL}/analyze-resume-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...this.getAuthHeaders()
        }
      });
      
      toast.dismiss(loadingToast);
      toast.success('Resume analysis completed!');
      
      return response.data;
    } catch (error) {
      console.error('Resume file analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Match student profile with internship
   */
  async matchProfile(studentProfile, internshipDetails, provider = 'openai') {
    try {
      const loadingToast = toast.loading('Matching profile with internship...');
      
      const response = await axios.post(`${this.baseURL}/match-profile`, {
        studentProfile,
        internshipDetails,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Profile matching completed!');
      
      return response.data;
    } catch (error) {
      console.error('Profile matching failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate interview questions
   */
  async generateInterviewQuestions(jobRole, skills, provider = 'openai') {
    try {
      const loadingToast = toast.loading('Generating interview questions...');
      
      const response = await axios.post(`${this.baseURL}/generate-interview-questions`, {
        jobRole,
        skills,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Interview questions generated!');
      
      return response.data;
    } catch (error) {
      console.error('Interview question generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Enhance application content
   */
  async enhanceContent(content, jobDescription, provider = 'openai') {
    try {
      const loadingToast = toast.loading('Enhancing content with AI...');
      
      const response = await axios.post(`${this.baseURL}/enhance-content`, {
        content,
        jobDescription,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Content enhancement completed!');
      
      return response.data;
    } catch (error) {
      console.error('Content enhancement failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Analyze skills gap
   */
  async analyzeSkillsGap(currentSkills, requiredSkills, provider = 'gemini') {
    try {
      const loadingToast = toast.loading('Analyzing skills gap...');
      
      const response = await axios.post(`${this.baseURL}/analyze-skills-gap`, {
        currentSkills,
        requiredSkills,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Skills gap analysis completed!');
      
      return response.data;
    } catch (error) {
      console.error('Skills gap analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate career guidance
   */
  async generateCareerGuidance(studentProfile, provider = 'openai') {
    try {
      const loadingToast = toast.loading('Generating career guidance...');
      
      const response = await axios.post(`${this.baseURL}/career-guidance`, {
        studentProfile,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Career guidance generated!');
      
      return response.data;
    } catch (error) {
      console.error('Career guidance generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Predict placement success
   */
  async predictPlacement(studentData, marketTrends, provider = 'gemini') {
    try {
      const loadingToast = toast.loading('Predicting placement success...');
      
      const response = await axios.post(`${this.baseURL}/predict-placement`, {
        studentData,
        marketTrends,
        provider
      }, {
        headers: this.getAuthHeaders()
      });
      
      toast.dismiss(loadingToast);
      toast.success('Placement prediction completed!');
      
      return response.data;
    } catch (error) {
      console.error('Placement prediction failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate comprehensive resume report
   */
  async generateResumeReport(file = null, resumeText = null) {
    try {
      const loadingToast = toast.loading('Generating comprehensive resume report...');
      
      let response;
      
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        
        response = await axios.post(`${this.baseURL}/generate-resume-report`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...this.getAuthHeaders()
          }
        });
      } else if (resumeText) {
        response = await axios.post(`${this.baseURL}/generate-resume-report`, {
          resumeText
        }, {
          headers: this.getAuthHeaders()
        });
      } else {
        throw new Error('Either file or resumeText must be provided');
      }
      
      toast.dismiss(loadingToast);
      toast.success('Resume report generated!');
      
      return response.data;
    } catch (error) {
      console.error('Resume report generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    let message = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          message = data.error || 'Invalid request data';
          break;
        case 401:
          message = 'Please log in to use AI features';
          break;
        case 403:
          message = 'Access denied to AI features';
          break;
        case 429:
          message = 'Too many requests. Please try again later';
          break;
        case 500:
          message = data.error || 'AI service is temporarily unavailable';
          break;
        default:
          message = data.error || `Server error (${status})`;
      }
      
      toast.error(message);
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection';
      toast.error(message);
    } else {
      // Other error
      message = error.message || 'An unexpected error occurred';
      toast.error(message);
    }
    
    return new Error(message);
  }

  /**
   * Format skills for API consumption
   */
  formatSkills(skillsArray) {
    if (Array.isArray(skillsArray)) {
      return skillsArray;
    }
    
    if (typeof skillsArray === 'string') {
      return skillsArray.split(',').map(skill => skill.trim()).filter(skill => skill);
    }
    
    return [];
  }

  /**
   * Validate file for upload
   */
  validateResumeFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Only PDF, DOCX, DOC, and TXT files are allowed');
    }
    
    if (!allowedTypes.includes(file.type) && file.type !== '') {
      // Some browsers don't set MIME type correctly, so we rely on extension as fallback
      console.warn('File type not recognized, but extension is valid:', file.type);
    }
    
    return true;
  }

  /**
   * Get AI provider status and capabilities
   */
  async getProviderCapabilities() {
    try {
      const health = await this.checkHealth();
      
      return {
        openai: {
          available: health.services?.openai?.status === 'healthy',
          capabilities: ['interview-questions', 'content-enhancement', 'career-guidance', 'profile-matching'],
          name: 'ChatGPT'
        },
        gemini: {
          available: health.services?.gemini?.status === 'healthy',
          capabilities: ['resume-analysis', 'skills-gap', 'placement-prediction', 'data-analysis'],
          name: 'Google Gemini'
        }
      };
    } catch (error) {
      console.error('Failed to get provider capabilities:', error);
      return {
        openai: { available: false, capabilities: [], name: 'ChatGPT' },
        gemini: { available: false, capabilities: [], name: 'Google Gemini' }
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Export both the class and the instance
export { AIService };
export default aiService;