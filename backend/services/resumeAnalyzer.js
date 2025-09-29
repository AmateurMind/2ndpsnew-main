const AIService = require('./aiService');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeAnalyzer {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Extract text from various file formats
   */
  async extractTextFromFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    try {
      switch (extension) {
        case '.pdf':
          return await this.extractTextFromPDF(filePath);
        case '.docx':
          return await this.extractTextFromDocx(filePath);
        case '.doc':
          return await this.extractTextFromDocx(filePath);
        case '.txt':
          return fs.readFileSync(filePath, 'utf8');
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  async extractTextFromDocx(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } catch (error) {
      throw new Error(`DOCX text extraction failed: ${error.message}`);
    }
  }

  /**
   * Clean and preprocess resume text
   */
  preprocessResumeText(text) {
    // Remove extra whitespaces and normalize line breaks
    let cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Remove common resume artifacts
    cleanText = cleanText.replace(/\f/g, ''); // Form feed characters
    cleanText = cleanText.replace(/\u00A0/g, ' '); // Non-breaking spaces
    
    // Normalize section headers
    cleanText = cleanText.replace(/(\b(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)\b)/gi, '\n$1\n');
    
    return cleanText;
  }

  /**
   * Analyze resume using AI (with fallback between providers)
   */
  async analyzeResumeWithAI(resumeText, preferredProvider = 'gemini') {
    const cleanText = this.preprocessResumeText(resumeText);
    
    try {
      // Try with preferred provider first
      const analysis = await this.aiService.analyzeResume(cleanText, preferredProvider);
      
      // Add metadata
      analysis.metadata = {
        analyzedAt: new Date(),
        provider: preferredProvider,
        textLength: cleanText.length,
        wordCount: cleanText.split(/\s+/).length
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Enhanced resume analysis with scoring and recommendations
   */
  async performComprehensiveAnalysis(resumeText) {
    try {
      // Get basic AI analysis
      const aiAnalysis = await this.analyzeResumeWithAI(resumeText);
      
      // Perform additional analysis
      const comprehensiveAnalysis = {
        ...aiAnalysis,
        detailedMetrics: await this.calculateDetailedMetrics(resumeText, aiAnalysis),
        marketAlignment: await this.assessMarketAlignment(aiAnalysis),
        recommendations: await this.generateEnhancedRecommendations(aiAnalysis),
        competitiveScore: this.calculateCompetitiveScore(aiAnalysis),
        industryInsights: await this.getIndustryInsights(aiAnalysis)
      };
      
      return comprehensiveAnalysis;
    } catch (error) {
      throw new Error(`Comprehensive resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate detailed resume metrics
   */
  async calculateDetailedMetrics(resumeText, aiAnalysis) {
    const words = resumeText.split(/\s+/);
    const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      skillsCount: {
        technical: aiAnalysis.skills.technical?.length || 0,
        soft: aiAnalysis.skills.soft?.length || 0,
        languages: aiAnalysis.skills.languages?.length || 0,
        tools: aiAnalysis.skills.tools?.length || 0
      },
      experienceYears: this.calculateExperienceYears(aiAnalysis.experience || []),
      projectCount: aiAnalysis.projects?.length || 0,
      certificationCount: aiAnalysis.certifications?.length || 0,
      achievementCount: aiAnalysis.achievements?.length || 0,
      readabilityScore: this.calculateReadabilityScore(resumeText),
      completenessScore: this.calculateCompletenessScore(aiAnalysis)
    };
  }

  /**
   * Calculate years of experience from experience array
   */
  calculateExperienceYears(experiences) {
    let totalYears = 0;
    
    experiences.forEach(exp => {
      const duration = exp.duration || '';
      const yearMatch = duration.match(/(\d+)\s*year/i);
      const monthMatch = duration.match(/(\d+)\s*month/i);
      
      if (yearMatch) {
        totalYears += parseInt(yearMatch[1]);
      }
      if (monthMatch) {
        totalYears += parseInt(monthMatch[1]) / 12;
      }
    });
    
    return Math.round(totalYears * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate basic readability score
   */
  calculateReadabilityScore(text) {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability calculation (lower is better for resumes)
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (avgWordsPerSentence > 25) score -= 10;
    if (words.length < 200) score -= 30;
    if (words.length > 800) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate completeness score based on resume sections
   */
  calculateCompletenessScore(analysis) {
    let score = 0;
    const maxScore = 100;
    
    // Essential sections (60 points)
    if (analysis.personalInfo?.name) score += 10;
    if (analysis.personalInfo?.email) score += 10;
    if (analysis.personalInfo?.phone) score += 5;
    if (analysis.skills?.technical?.length > 0) score += 15;
    if (analysis.experience?.length > 0) score += 20;
    
    // Important sections (30 points)
    if (analysis.education?.length > 0) score += 10;
    if (analysis.projects?.length > 0) score += 10;
    if (analysis.summary && analysis.summary.length > 50) score += 10;
    
    // Additional sections (10 points)
    if (analysis.certifications?.length > 0) score += 5;
    if (analysis.achievements?.length > 0) score += 5;
    
    return Math.min(maxScore, score);
  }

  /**
   * Assess how well the resume aligns with current market trends
   */
  async assessMarketAlignment(analysis) {
    // This would typically connect to job market APIs or databases
    // For now, we'll use AI to assess market alignment
    try {
      const marketData = {
        trendingSkills: ['React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning'],
        demandingRoles: ['Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Cloud Engineer'],
        emergingTechnologies: ['AI/ML', 'Blockchain', 'IoT', 'Cybersecurity']
      };
      
      // Use AI to analyze market alignment
      const alignment = await this.aiService.gemini.analyzeDataset({
        resumeSkills: analysis.skills,
        marketTrends: marketData,
        experience: analysis.experience
      }, 'market_alignment');
      
      return alignment;
    } catch (error) {
      console.error('Market alignment assessment failed:', error);
      return {
        score: 70,
        alignment: 'Moderate',
        insights: ['Unable to assess current market trends']
      };
    }
  }

  /**
   * Generate enhanced recommendations beyond basic AI suggestions
   */
  async generateEnhancedRecommendations(analysis) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      formatting: [],
      content: []
    };

    // Formatting recommendations
    if (!analysis.personalInfo?.phone) {
      recommendations.formatting.push('Add contact phone number');
    }
    if (!analysis.personalInfo?.location) {
      recommendations.formatting.push('Include location/city');
    }

    // Content recommendations
    if (!analysis.summary || analysis.summary.length < 100) {
      recommendations.content.push('Add a compelling professional summary');
    }
    if (analysis.projects?.length < 2) {
      recommendations.content.push('Include more project examples to demonstrate skills');
    }
    if (analysis.skills?.technical?.length < 5) {
      recommendations.content.push('Expand technical skills section');
    }

    // Experience recommendations
    if (analysis.experience?.length === 0) {
      recommendations.immediate.push('Add work experience or internship details');
    }

    return recommendations;
  }

  /**
   * Calculate competitive score compared to industry standards
   */
  calculateCompetitiveScore(analysis) {
    let score = 0;
    
    // Skills diversity (25 points)
    const totalSkills = (analysis.skills?.technical?.length || 0) + 
                       (analysis.skills?.soft?.length || 0) + 
                       (analysis.skills?.tools?.length || 0);
    score += Math.min(25, totalSkills * 2);
    
    // Experience quality (25 points)
    const experienceCount = analysis.experience?.length || 0;
    score += Math.min(25, experienceCount * 8);
    
    // Project portfolio (20 points)
    const projectCount = analysis.projects?.length || 0;
    score += Math.min(20, projectCount * 6);
    
    // Education and certifications (15 points)
    const educationCount = analysis.education?.length || 0;
    const certCount = analysis.certifications?.length || 0;
    score += Math.min(15, (educationCount * 5) + (certCount * 3));
    
    // Overall quality (15 points)
    score += Math.min(15, analysis.overallScore * 0.15);
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Get industry-specific insights
   */
  async getIndustryInsights(analysis) {
    // Determine likely industry based on skills and experience
    const skills = [
      ...(analysis.skills?.technical || []),
      ...(analysis.skills?.tools || [])
    ];
    
    const industryKeywords = {
      'Software Development': ['javascript', 'python', 'java', 'react', 'node.js', 'git'],
      'Data Science': ['python', 'sql', 'machine learning', 'pandas', 'tensorflow', 'r'],
      'DevOps': ['docker', 'kubernetes', 'aws', 'jenkins', 'terraform', 'ansible'],
      'UI/UX Design': ['figma', 'sketch', 'adobe', 'user research', 'wireframing', 'prototyping'],
      'Cybersecurity': ['security', 'penetration testing', 'firewall', 'encryption', 'compliance']
    };
    
    let likelyIndustry = 'General Technology';
    let maxMatches = 0;
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const matches = keywords.filter(keyword => 
        skills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        likelyIndustry = industry;
      }
    }
    
    return {
      suggestedIndustry: likelyIndustry,
      matchingKeywords: maxMatches,
      industryTrends: await this.getIndustryTrends(likelyIndustry),
      careerPaths: await this.getCareerPaths(likelyIndustry, analysis)
    };
  }

  /**
   * Get current trends for a specific industry
   */
  async getIndustryTrends(industry) {
    // This would typically connect to industry APIs or databases
    const trends = {
      'Software Development': [
        'Full-stack development skills are in high demand',
        'Cloud-native development is becoming standard',
        'AI/ML integration in applications is growing'
      ],
      'Data Science': [
        'MLOps and production ML skills are crucial',
        'Real-time analytics and streaming data processing',
        'Ethical AI and responsible data practices'
      ],
      'DevOps': [
        'GitOps and Infrastructure as Code adoption',
        'Container orchestration and microservices',
        'Security integration in CI/CD pipelines'
      ],
      'Default': [
        'Remote work capabilities are essential',
        'Continuous learning and adaptability',
        'Cross-functional collaboration skills'
      ]
    };
    
    return trends[industry] || trends['Default'];
  }

  /**
   * Get potential career paths based on industry and current profile
   */
  async getCareerPaths(industry, analysis) {
    try {
      return await this.aiService.generateCareerGuidance(analysis);
    } catch (error) {
      console.error('Career path generation failed:', error);
      return {
        careerPaths: [
          {
            title: `Junior ${industry} Professional`,
            description: 'Entry-level position to start your career',
            steps: ['Build foundational skills', 'Create portfolio projects', 'Apply for internships']
          }
        ]
      };
    }
  }

  /**
   * Generate a comprehensive resume report
   */
  async generateResumeReport(resumeText) {
    try {
      const analysis = await this.performComprehensiveAnalysis(resumeText);
      
      const report = {
        summary: {
          overallScore: analysis.overallScore,
          competitiveScore: analysis.competitiveScore,
          completenessScore: analysis.detailedMetrics.completenessScore,
          readabilityScore: analysis.detailedMetrics.readabilityScore
        },
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        detailedAnalysis: analysis.detailedMetrics,
        marketInsights: analysis.marketAlignment,
        industryRecommendations: analysis.industryInsights,
        actionItems: analysis.recommendations,
        generatedAt: new Date(),
        provider: analysis.metadata.provider
      };
      
      return report;
    } catch (error) {
      throw new Error(`Resume report generation failed: ${error.message}`);
    }
  }
}

module.exports = ResumeAnalyzer;