const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the latest Gemini 2.0 Flash model (same as used in Streamlit)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Test Gemini connection
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent("Hello");
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini connection failed: ${error.message}`);
    }
  }

  /**
   * Analyze resume content and extract structured data
   * Gemini excels at data extraction and structured analysis
   */
  async analyzeResume(resumeText) {
    const prompt = `
    Analyze the following resume and extract structured information. Return ONLY a valid JSON object with the following structure:
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
      "overallScore": 85,
      "strengths": ["array of key strengths"],
      "improvements": ["array of improvement suggestions"]
    }

    Resume Text:
    ${resumeText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Match student profile with internship requirements
   * Gemini excels at detailed analysis and pattern matching
   */
  async matchProfileToInternship(studentProfile, internshipDetails) {
    const prompt = `
    Analyze how well this student profile matches the internship requirements and provide a detailed matching analysis.
    Return ONLY a valid JSON object.

    Student Profile:
    ${JSON.stringify(studentProfile, null, 2)}

    Internship Details:
    ${JSON.stringify(internshipDetails, null, 2)}

    Return JSON with this structure:
    {
      "overallScore": 75,
      "matchingSkills": ["array of matching skills"],
      "missingSkills": ["array of missing skills"],
      "strengthAreas": ["array of areas where student excels"],
      "weaknessAreas": ["array of areas needing improvement"],
      "recommendations": ["array of specific recommendations"],
      "likelihood": "Medium",
      "keyHighlights": ["array of standout qualities"],
      "improvementPlan": {
        "immediate": ["things to do immediately"],
        "shortTerm": ["things to do in 1-3 months"],
        "longTerm": ["things to do in 3+ months"]
      }
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
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
    Generate comprehensive interview questions for the following job role and required skills.
    Return ONLY a valid JSON object.

    Job Role: ${JSON.stringify(jobRole)}
    Required Skills: ${JSON.stringify(skills)}

    Create 3 categories of questions:
    1. Technical Questions (5-7 questions)
    2. Behavioral Questions (4-5 questions)
    3. Situational Questions (3-4 questions)

    Return JSON with this structure:
    {
      "technical": [
        {
          "question": "string",
          "difficulty": "Medium",
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
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
    Return ONLY a valid JSON object.

    Original Content:
    ${content}

    Job Description:
    ${jobDescription}

    Return JSON with this structure:
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
      "overallScore": 80,
      "suggestions": ["array of additional suggestions"]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Content enhancement failed: ${error.message}`);
    }
  }

  /**
   * Analyze skills gap and provide recommendations
   * Gemini is excellent at comprehensive data analysis
   */
  async analyzeSkillsGap(currentSkills, requiredSkills) {
    const prompt = `
    Analyze the skills gap between current skills and required skills for target roles.
    Provide detailed analysis and learning recommendations.
    Return ONLY a valid JSON object.

    Current Skills: ${JSON.stringify(currentSkills)}
    Required Skills: ${JSON.stringify(requiredSkills)}

    Return JSON with this structure:
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
          "currentLevel": "Beginner",
          "targetLevel": "Intermediate",
          "estimatedTime": "string",
          "resources": ["array of learning resources"],
          "projects": ["array of project ideas to practice"]
        }
      ],
      "overallReadiness": 65,
      "recommendations": ["specific actionable recommendations"]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
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
    Return ONLY a valid JSON object.

    Student Profile: ${JSON.stringify(studentProfile)}

    Return JSON with this structure:
    {
      "careerPaths": [
        {
          "title": "string",
          "description": "string",
          "matchScore": 85,
          "requiredSkills": ["array of skills needed"],
          "averageSalary": "string",
          "growthProspects": "High",
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Career guidance generation failed: ${error.message}`);
    }
  }

  /**
   * Predict placement success rate
   * Gemini excels at data analysis and trend prediction
   */
  async predictPlacementSuccess(studentData, marketTrends) {
    const prompt = `
    Analyze the student data and market trends to predict placement success rate.
    Provide detailed analysis based on historical patterns and current market conditions.
    Return ONLY a valid JSON object.

    Student Data: ${JSON.stringify(studentData)}
    Market Trends: ${JSON.stringify(marketTrends)}

    Return JSON with this structure:
    {
      "successProbability": 78,
      "confidence": "High",
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
      "marketAlignment": 85,
      "competitiveAdvantage": ["student's unique selling points"],
      "riskMitigation": ["strategies to reduce placement risk"]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Placement prediction failed: ${error.message}`);
    }
  }

  /**
   * Analyze large datasets and extract insights
   * Gemini's strength in processing and analyzing large amounts of data
   */
  async analyzeDataset(data, analysisType = 'comprehensive') {
    const prompt = `
    Analyze the following dataset and provide comprehensive insights.
    Focus on patterns, trends, and actionable recommendations.
    Return ONLY a valid JSON object.

    Dataset: ${JSON.stringify(data)}
    Analysis Type: ${analysisType}

    Return JSON with this structure:
    {
      "summary": {
        "totalRecords": 0,
        "keyMetrics": {},
        "dataQuality": "string"
      },
      "patterns": [
        {
          "pattern": "string",
          "frequency": "string",
          "significance": "High/Medium/Low"
        }
      ],
      "trends": [
        {
          "trend": "string",
          "direction": "Increasing/Decreasing/Stable",
          "impact": "string"
        }
      ],
      "insights": ["array of key insights"],
      "recommendations": ["array of actionable recommendations"],
      "visualizationSuggestions": [
        {
          "type": "chart type",
          "data": "suggested data to visualize",
          "purpose": "why this visualization helps"
        }
      ]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Dataset analysis failed: ${error.message}`);
    }
  }

  /**
   * Read and parse various document formats
   * Gemini's strength in document understanding
   */
  async parseDocument(documentContent, documentType = 'resume') {
    const prompt = `
    Parse and extract structured information from this ${documentType} document.
    Return ONLY a valid JSON object with extracted and organized data.

    Document Content:
    ${documentContent}

    Return JSON with appropriate structure based on document type.
    For resumes, extract personal info, skills, experience, education.
    For job descriptions, extract requirements, responsibilities, company info.
    For academic transcripts, extract courses, grades, achievements.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Document parsing failed: ${error.message}`);
    }
  }

  /**
   * Generate personalized recommendations based on user behavior and preferences
   */
  async generatePersonalizedRecommendations(userProfile, interactionHistory, availableOptions) {
    const prompt = `
    Generate personalized recommendations based on user profile and interaction history.
    Return ONLY a valid JSON object.

    User Profile: ${JSON.stringify(userProfile)}
    Interaction History: ${JSON.stringify(interactionHistory)}
    Available Options: ${JSON.stringify(availableOptions)}

    Return JSON with this structure:
    {
      "recommendations": [
        {
          "item": "string",
          "score": 95,
          "reason": "string",
          "category": "string"
        }
      ],
      "personalizationFactors": ["factors used for personalization"],
      "diversityScore": 85,
      "confidence": "High"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Personalized recommendations failed: ${error.message}`);
    }
  }
}

module.exports = GeminiService;