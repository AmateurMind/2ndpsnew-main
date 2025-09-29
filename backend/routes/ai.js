const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const ResumeAnalyzer = require('../services/resumeAnalyzer');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize services
const aiService = new AIService();
const resumeAnalyzer = new ResumeAnalyzer();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads/temp/'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @route GET /api/ai/health
 * @desc Check AI services health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.getServiceHealth();
    res.json({
      message: 'AI services health check',
      services: health,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI health check failed:', error);
    res.status(500).json({
      error: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/analyze-resume-text
 * @desc Analyze resume from text input
 * @access Private
 */
router.post('/analyze-resume-text', authenticate, async (req, res) => {
  try {
    const { resumeText, provider = 'gemini' } = req.body;
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        error: 'Resume text is required'
      });
    }
    
    const analysis = await aiService.analyzeResume(resumeText, provider);
    
    res.json({
      message: 'Resume analysis completed',
      analysis,
      analyzedBy: provider
    });
  } catch (error) {
    console.error('Resume text analysis failed:', error);
    res.status(500).json({
      error: 'Resume analysis failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/analyze-resume-file
 * @desc Analyze resume from uploaded file
 * @access Private
 */
router.post('/analyze-resume-file', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Resume file is required'
      });
    }
    
    const { provider = 'gemini' } = req.body;
    const filePath = req.file.path;
    
    // Extract text from file
    const resumeText = await resumeAnalyzer.extractTextFromFile(filePath);
    
    // Analyze with AI
    const analysis = await resumeAnalyzer.performComprehensiveAnalysis(resumeText);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'Resume file analysis completed',
      analysis,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        type: path.extname(req.file.originalname)
      }
    });
  } catch (error) {
    console.error('Resume file analysis failed:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Resume file analysis failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/match-profile
 * @desc Match student profile with internship
 * @access Private
 */
router.post('/match-profile', authenticate, async (req, res) => {
  try {
    const { studentProfile, internshipDetails, provider = 'openai' } = req.body;
    
    if (!studentProfile || !internshipDetails) {
      return res.status(400).json({
        error: 'Student profile and internship details are required'
      });
    }
    
    const matchAnalysis = await aiService.matchProfileToInternship(
      studentProfile,
      internshipDetails,
      provider
    );
    
    res.json({
      message: 'Profile matching completed',
      match: matchAnalysis,
      analyzedBy: provider
    });
  } catch (error) {
    console.error('Profile matching failed:', error);
    res.status(500).json({
      error: 'Profile matching failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-interview-questions
 * @desc Generate interview questions for a role
 * @access Private
 */
router.post('/generate-interview-questions', authenticate, async (req, res) => {
  try {
    const { jobRole, skills, provider = 'openai' } = req.body;
    
    if (!jobRole || !skills) {
      return res.status(400).json({
        error: 'Job role and skills are required'
      });
    }
    
    const questions = await aiService.generateInterviewQuestions(jobRole, skills, provider);
    
    res.json({
      message: 'Interview questions generated',
      questions,
      generatedBy: provider,
      jobRole,
      skills
    });
  } catch (error) {
    console.error('Interview question generation failed:', error);
    res.status(500).json({
      error: 'Interview question generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/enhance-content
 * @desc Enhance application content
 * @access Private
 */
router.post('/enhance-content', authenticate, async (req, res) => {
  try {
    const { content, jobDescription, provider = 'openai' } = req.body;
    
    if (!content || !jobDescription) {
      return res.status(400).json({
        error: 'Content and job description are required'
      });
    }
    
    const enhancement = await aiService.enhanceApplicationContent(
      content,
      jobDescription,
      provider
    );
    
    res.json({
      message: 'Content enhancement completed',
      enhancement,
      enhancedBy: provider
    });
  } catch (error) {
    console.error('Content enhancement failed:', error);
    res.status(500).json({
      error: 'Content enhancement failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/analyze-skills-gap
 * @desc Analyze skills gap and provide recommendations
 * @access Private
 */
router.post('/analyze-skills-gap', authenticate, async (req, res) => {
  try {
    const { currentSkills, requiredSkills, provider = 'gemini' } = req.body;
    
    if (!currentSkills || !requiredSkills) {
      return res.status(400).json({
        error: 'Current skills and required skills are required'
      });
    }
    
    const analysis = await aiService.analyzeSkillsGap(
      currentSkills,
      requiredSkills,
      provider
    );
    
    res.json({
      message: 'Skills gap analysis completed',
      analysis,
      analyzedBy: provider
    });
  } catch (error) {
    console.error('Skills gap analysis failed:', error);
    res.status(500).json({
      error: 'Skills gap analysis failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/career-guidance
 * @desc Generate career guidance
 * @access Private
 */
router.post('/career-guidance', authenticate, async (req, res) => {
  try {
    const { studentProfile, provider = 'openai' } = req.body;
    
    if (!studentProfile) {
      return res.status(400).json({
        error: 'Student profile is required'
      });
    }
    
    const guidance = await aiService.generateCareerGuidance(studentProfile, provider);
    
    res.json({
      message: 'Career guidance generated',
      guidance,
      generatedBy: provider
    });
  } catch (error) {
    console.error('Career guidance generation failed:', error);
    res.status(500).json({
      error: 'Career guidance generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/predict-placement
 * @desc Predict placement success rate
 * @access Private
 */
router.post('/predict-placement', authenticate, async (req, res) => {
  try {
    const { studentData, marketTrends, provider = 'gemini' } = req.body;
    
    if (!studentData) {
      return res.status(400).json({
        error: 'Student data is required'
      });
    }
    
    // Use default market trends if not provided
    const defaultMarketTrends = {
      industryGrowth: 'Stable',
      demandingSkills: ['JavaScript', 'Python', 'React', 'Node.js'],
      averageHiringTime: '2-3 months',
      competitionLevel: 'High'
    };
    
    const prediction = await aiService.predictPlacementSuccess(
      studentData,
      marketTrends || defaultMarketTrends,
      provider
    );
    
    res.json({
      message: 'Placement prediction completed',
      prediction,
      analyzedBy: provider
    });
  } catch (error) {
    console.error('Placement prediction failed:', error);
    res.status(500).json({
      error: 'Placement prediction failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-resume-report
 * @desc Generate comprehensive resume report
 * @access Private
 */
router.post('/generate-resume-report', authenticate, upload.single('resume'), async (req, res) => {
  try {
    let resumeText;
    
    if (req.file) {
      // Extract text from uploaded file
      resumeText = await resumeAnalyzer.extractTextFromFile(req.file.path);
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({
        error: 'Resume file or resume text is required'
      });
    }
    
    const report = await resumeAnalyzer.generateResumeReport(resumeText);
    
    res.json({
      message: 'Resume report generated successfully',
      report
    });
  } catch (error) {
    console.error('Resume report generation failed:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Resume report generation failed',
      details: error.message
    });
  }
});

module.exports = router;
