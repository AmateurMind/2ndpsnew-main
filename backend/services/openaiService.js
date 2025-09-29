const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // Check if using OpenRouter (keys starting with sk-or-)
    const isOpenRouter = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-or-');
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Campus Placement Portal'
      } : undefined
    });
    
    // Use Gemini Flash model for OpenRouter, GPT for direct OpenAI
    this.model = isOpenRouter ? 'google/gemini-flash-1.5' : 'gpt-4o-mini';
    this.isOpenRouter = isOpenRouter;
  }

  /**
   * Test OpenAI connection
   */
  async testConnection() {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      return response;
    } catch (error) {
      throw new Error(`OpenAI connection failed: ${error.message}`);
    }
  }

  /**
   * Analyze resume content and extract structured data
   */
  async analyzeResume(resumeText) {
    const prompt = `
    Analyze the following resume and extract structured information. Return a JSON object with the following structure:
    {
      "personalInfo": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": "string"
      },
      "summary": "string",
      "skills": {
        "technical": ["array of technical skills"],
        "soft": ["array of soft skills"],
        "languages": ["array of programming languages"],
        "tools": ["array of tools and technologies"]
      },
      "experience": [
        {
          "title": "string",
          "company": "string",
          "duration": "string",
          "description": "string",
          "achievements": ["array of achievements"]
        }
      ],
      "education": [
        {
          "degree": "string",
          "institution": "string",
          "year": "string",
          "gpa": "string or null"
        }
      ],
      "projects": [
        {
          "name": "string",
          "description": "string",
          "technologies": ["array of technologies used"],
          "link": "string or null"
        }
      ],
      "certifications": ["array of certifications"],
      "achievements": ["array of achievements and awards"],
      "overallScore": "number (1-100)",
      "strengths": ["array of key strengths"],
      "improvements": ["array of improvement suggestions"]
    }

    Resume Text:
    ${resumeText}
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Match student profile with internship requirements
   */
  async matchProfileToInternship(studentProfile, internshipDetails) {
    const prompt = `
    Analyze how well this student profile matches the internship requirements and provide a detailed matching analysis.

    Student Profile:
    ${JSON.stringify(studentProfile, null, 2)}

    Internship Details:
    ${JSON.stringify(internshipDetails, null, 2)}

    Return a JSON object with this structure:
    {
      "overallScore": "number (0-100)",
      "matchingSkills": ["array of matching skills"],
      "missingSkills": ["array of missing skills"],
      "strengthAreas": ["array of areas where student excels"],
      "weaknessAreas": ["array of areas needing improvement"],
      "recommendations": ["array of specific recommendations"],
      "likelihood": "string (High/Medium/Low)",
      "keyHighlights": ["array of standout qualities"],
      "improvementPlan": {
        "immediate": ["things to do immediately"],
        "shortTerm": ["things to do in 1-3 months"],
        "longTerm": ["things to do in 3+ months"]
      }
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.4
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Profile matching failed: ${error.message}`);
    }
  }

  /**
   * Generate interview questions based on role and skills
   */
  async generateInterviewQuestions(jobRole, skills) {
    const prompt = `
    Generate comprehensive interview questions for the following job role and required skills:

    Job Role: ${JSON.stringify(jobRole)}
    Required Skills: ${JSON.stringify(skills)}

    Create 3 categories of questions:
    1. Technical Questions (5-7 questions)
    2. Behavioral Questions (4-5 questions)
    3. Situational Questions (3-4 questions)

    Return a JSON object with this structure:
    {
      "technical": [
        {
          "question": "string",
          "difficulty": "Easy/Medium/Hard",
          "expectedAnswer": "string (brief outline)",
          "keyPoints": ["array of key points to look for"]
        }
      ],
      "behavioral": [
        {
          "question": "string",
          "purpose": "string (what this question assesses)",
          "goodAnswerIndicators": ["array of positive signs"]
        }
      ],
      "situational": [
        {
          "question": "string",
          "scenario": "string",
          "evaluationCriteria": ["array of evaluation points"]
        }
      ]
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.6
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Interview question generation failed: ${error.message}`);
    }
  }

  /**
   * Enhance application content (cover letters, etc.)
   */
  async enhanceApplicationContent(content, jobDescription) {
    const prompt = `
    Enhance the following application content to better match the job description. 
    Provide improvements while maintaining authenticity and the applicant's voice.

    Original Content:
    ${content}

    Job Description:
    ${jobDescription}

    Return a JSON object with this structure:
    {
      "enhancedContent": "string (improved version)",
      "improvements": [
        {
          "section": "string (which part was improved)",
          "original": "string (original text)",
          "improved": "string (improved text)",
          "reason": "string (why this improvement helps)"
        }
      ],
      "keywordsSuggested": ["array of relevant keywords to include"],
      "overallScore": "number (1-100)",
      "suggestions": ["array of additional suggestions"]
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.4
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Content enhancement failed: ${error.message}`);
    }
  }

  /**
   * Analyze skills gap and provide recommendations
   */
  async analyzeSkillsGap(currentSkills, requiredSkills) {
    const prompt = `
    Analyze the skills gap between current skills and required skills for target roles.

    Current Skills: ${JSON.stringify(currentSkills)}
    Required Skills: ${JSON.stringify(requiredSkills)}

    Return a JSON object with this structure:
    {
      "gapAnalysis": {
        "matchingSkills": ["skills student already has"],
        "missingSkills": ["skills student needs to develop"],
        "partialSkills": ["skills student has but needs improvement"]
      },
      "priorityLevels": {
        "critical": ["must-have skills for immediate focus"],
        "important": ["valuable skills for medium-term development"],
        "beneficial": ["nice-to-have skills for long-term growth"]
      },
      "learningPath": [
        {
          "skill": "string",
          "currentLevel": "Beginner/Intermediate/Advanced",
          "targetLevel": "Beginner/Intermediate/Advanced",
          "estimatedTime": "string",
          "resources": ["array of learning resources"],
          "projects": ["array of project ideas to practice"]
        }
      ],
      "overallReadiness": "number (0-100)",
      "recommendations": ["specific actionable recommendations"]
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.4
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Skills gap analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate career guidance based on student profile
   */
  async generateCareerGuidance(studentProfile) {
    const prompt = `
    Provide comprehensive career guidance based on the student's profile.

    Student Profile: ${JSON.stringify(studentProfile)}

    Return a JSON object with this structure:
    {
      "careerPaths": [
        {
          "title": "string",
          "description": "string",
          "matchScore": "number (0-100)",
          "requiredSkills": ["array of skills needed"],
          "averageSalary": "string",
          "growthProspects": "High/Medium/Low",
          "steps": ["array of steps to pursue this path"]
        }
      ],
      "strengths": ["array of student's key strengths"],
      "developmentAreas": ["array of areas to develop"],
      "shortTermGoals": ["array of 3-6 month goals"],
      "longTermGoals": ["array of 1-2 year goals"],
      "industryTrends": ["relevant industry trends to be aware of"],
      "networking": {
        "events": ["types of events to attend"],
        "platforms": ["professional platforms to join"],
        "people": ["types of professionals to connect with"]
      },
      "resources": {
        "courses": ["recommended online courses"],
        "books": ["recommended reading"],
        "websites": ["useful websites and blogs"],
        "tools": ["professional tools to learn"]
      }
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.5
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Career guidance generation failed: ${error.message}`);
    }
  }

  /**
   * Predict placement success rate
   */
  async predictPlacementSuccess(studentData, marketTrends) {
    const prompt = `
    Analyze the student data and market trends to predict placement success rate.

    Student Data: ${JSON.stringify(studentData)}
    Market Trends: ${JSON.stringify(marketTrends)}

    Return a JSON object with this structure:
    {
      "successProbability": "number (0-100)",
      "confidence": "High/Medium/Low",
      "factors": {
        "positive": ["factors increasing placement chances"],
        "negative": ["factors decreasing placement chances"],
        "neutral": ["neutral factors"]
      },
      "recommendations": {
        "immediate": ["actions to take now"],
        "shortTerm": ["actions for next 1-3 months"],
        "longTerm": ["strategic long-term actions"]
      },
      "timelineEstimate": "string (expected time to placement)",
      "marketAlignment": "number (0-100) how well aligned with market",
      "competitiveAdvantage": ["student's unique selling points"],
      "riskMitigation": ["strategies to reduce placement risk"]
    }
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.4
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Placement prediction failed: ${error.message}`);
    }
  }
}

module.exports = OpenAIService;