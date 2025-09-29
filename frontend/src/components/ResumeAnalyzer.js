import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, TrendingUp, Target, Star, AlertCircle } from 'lucide-react';
import aiService from '../utils/aiService';
import toast from 'react-hot-toast';

const ResumeAnalyzer = ({ onAnalysisComplete = null, className = '' }) => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('file'); // 'file' or 'text'
  const [provider, setProvider] = useState('gemini');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        aiService.validateResumeFile(selectedFile);
        setFile(selectedFile);
        toast.success('Resume file selected successfully');
      } catch (error) {
        toast.error(error.message);
        setFile(null);
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      let result;

      if (analysisType === 'file') {
        if (!file) {
          toast.error('Please select a resume file');
          return;
        }
        result = await aiService.analyzeResumeFile(file, provider);
      } else {
        if (!resumeText.trim()) {
          toast.error('Please enter resume text');
          return;
        }
        result = await aiService.analyzeResumeText(resumeText, provider);
      }

      setAnalysis(result.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(result.analysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let result;

      if (analysisType === 'file' && file) {
        result = await aiService.generateResumeReport(file);
      } else if (analysisType === 'text' && resumeText) {
        result = await aiService.generateResumeReport(null, resumeText);
      } else {
        toast.error('Please provide resume content first');
        return;
      }

      setAnalysis(result.report);
      if (onAnalysisComplete) {
        onAnalysisComplete(result.report);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ScoreCard = ({ label, score, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };

    const getScoreColor = (score) => {
      if (score >= 80) return 'green';
      if (score >= 60) return 'yellow';
      return 'red';
    };

    const scoreColor = color === 'auto' ? getScoreColor(score) : color;

    return (
      <div className={`p-4 rounded-lg border ${colorClasses[scoreColor]}`}>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-2xl font-bold mt-1">{score}/100</div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">AI Resume Analyzer</h2>
      </div>

      {!analysis ? (
        <div className="space-y-6">
          {/* Analysis Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to analyze your resume?
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setAnalysisType('file')}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                  analysisType === 'file'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-2" />
                Upload File
              </button>
              <button
                onClick={() => setAnalysisType('text')}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                  analysisType === 'text'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-2" />
                Paste Text
              </button>
            </div>
          </div>

          {/* AI Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="gemini">Google Gemini (Recommended for Resume Analysis)</option>
              <option value="openai">OpenAI ChatGPT</option>
            </select>
          </div>

          {/* File Upload */}
          {analysisType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </button>
                {file && (
                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
                </div>
              </div>
            </div>
          )}

          {/* Text Input */}
          {analysisType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Paste your resume content here..."
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || (analysisType === 'file' && !file) || (analysisType === 'text' && !resumeText.trim())}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Quick Analysis'}
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={loading || (analysisType === 'file' && !file) || (analysisType === 'text' && !resumeText.trim())}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Detailed Report'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
            <button
              onClick={clearAnalysis}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              New Analysis
            </button>
          </div>

          {/* Score Overview */}
          {(analysis.overallScore || analysis.summary) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {analysis.overallScore && (
                <ScoreCard 
                  label="Overall Score" 
                  score={analysis.overallScore} 
                  color="auto"
                />
              )}
              {analysis.summary?.overallScore && (
                <ScoreCard 
                  label="Overall Score" 
                  score={analysis.summary.overallScore} 
                  color="auto"
                />
              )}
              {analysis.competitiveScore && (
                <ScoreCard 
                  label="Competitive Score" 
                  score={analysis.competitiveScore} 
                  color="blue"
                />
              )}
              {analysis.summary?.competitiveScore && (
                <ScoreCard 
                  label="Competitive Score" 
                  score={analysis.summary.competitiveScore} 
                  color="blue"
                />
              )}
              {analysis.summary?.completenessScore && (
                <ScoreCard 
                  label="Completeness" 
                  score={analysis.summary.completenessScore} 
                  color="green"
                />
              )}
              {analysis.summary?.readabilityScore && (
                <ScoreCard 
                  label="Readability" 
                  score={analysis.summary.readabilityScore} 
                  color="yellow"
                />
              )}
            </div>
          )}

          {/* Personal Info */}
          {analysis.personalInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {analysis.personalInfo.name && (
                  <div><span className="font-medium">Name:</span> {analysis.personalInfo.name}</div>
                )}
                {analysis.personalInfo.email && (
                  <div><span className="font-medium">Email:</span> {analysis.personalInfo.email}</div>
                )}
                {analysis.personalInfo.phone && (
                  <div><span className="font-medium">Phone:</span> {analysis.personalInfo.phone}</div>
                )}
                {analysis.personalInfo.location && (
                  <div><span className="font-medium">Location:</span> {analysis.personalInfo.location}</div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {analysis.skills && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Skills Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.skills.technical?.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Technical Skills</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.skills.technical.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.skills.soft?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">Soft Skills</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.skills.soft.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.strengths?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Strengths
                </h5>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.improvements?.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h5 className="font-medium text-orange-900 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Areas for Improvement
                </h5>
                <ul className="space-y-1">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-orange-800 flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Experience */}
          {analysis.experience?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Experience</h4>
              <div className="space-y-3">
                {analysis.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4 py-2">
                    <div className="font-medium text-gray-900">{exp.title}</div>
                    <div className="text-sm text-gray-600">{exp.company} • {exp.duration}</div>
                    {exp.description && (
                      <div className="text-sm text-gray-700 mt-1">{exp.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Metrics */}
          {analysis.detailedAnalysis && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Detailed Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Word Count</div>
                  <div className="text-gray-600">{analysis.detailedAnalysis.wordCount}</div>
                </div>
                <div>
                  <div className="font-medium">Experience</div>
                  <div className="text-gray-600">{analysis.detailedAnalysis.experienceYears} years</div>
                </div>
                <div>
                  <div className="font-medium">Projects</div>
                  <div className="text-gray-600">{analysis.detailedAnalysis.projectCount}</div>
                </div>
                <div>
                  <div className="font-medium">Certifications</div>
                  <div className="text-gray-600">{analysis.detailedAnalysis.certificationCount}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {analysis.metadata && (
            <div className="text-xs text-gray-500 border-t pt-3">
              Analyzed on {new Date(analysis.metadata.analyzedAt).toLocaleString()} 
              using {analysis.metadata.provider === 'gemini' ? 'Google Gemini' : 'OpenAI ChatGPT'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;