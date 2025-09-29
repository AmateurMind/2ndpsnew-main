import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Brain, Sparkles, TrendingUp, Target, MessageSquare, Award } from 'lucide-react';
import ResumeAnalyzer from '../../components/ResumeAnalyzer';
import CareerGuidance from '../../components/CareerGuidance';
import SkillsGapAnalysis from '../../components/SkillsGapAnalysis';

const StudentAITools = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const aiTools = [
    {
      id: 'resume',
      name: 'Resume Analyzer',
      description: 'Get AI-powered feedback on your resume with detailed analysis and improvement suggestions',
      icon: '📊',
      color: 'purple',
      features: ['Extract structured data', 'Score your resume', 'Get improvement tips', 'Compare with industry standards']
    },
    {
      id: 'career',
      name: 'Career Guidance',
      description: 'Receive personalized career recommendations based on your profile and market trends',
      icon: '🧭',
      color: 'indigo',
      features: ['Career path recommendations', 'Industry insights', 'Skill development roadmap', 'Networking strategy']
    },
    {
      id: 'skills',
      name: 'Skills Gap Analysis',
      description: 'Discover which skills you need to develop for your target career',
      icon: '🎯',
      color: 'green',
      features: ['Gap identification', 'Learning priorities', 'Resource recommendations', 'Progress tracking']
    },
    {
      id: 'interview',
      name: 'Interview Prep (Coming Soon)',
      description: 'Practice with AI-generated interview questions tailored to your target role',
      icon: '💬',
      color: 'blue',
      features: ['Role-specific questions', 'Practice sessions', 'Answer feedback', 'Confidence building'],
      comingSoon: true
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    return colors[color] || colors.purple;
  };

  const getButtonColorClasses = (color, isActive = false) => {
    const colors = {
      purple: isActive 
        ? 'bg-purple-600 text-white shadow-md' 
        : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      indigo: isActive 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      green: isActive 
        ? 'bg-green-600 text-white shadow-md' 
        : 'bg-green-100 text-green-700 hover:bg-green-200',
      blue: isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Brain className="w-8 h-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Career Tools</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Leverage the power of artificial intelligence to accelerate your career development. 
          Get personalized insights, recommendations, and guidance powered by ChatGPT and Google Gemini.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resume'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Resume Analysis
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'career'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧭 Career Guidance
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skills'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Skills Analysis
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Welcome to AI Career Tools</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Hello {user.name}! Our AI-powered tools are designed to help you succeed in your career journey. 
              Each tool uses advanced AI models to provide personalized insights and recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">🎯</div>
                <h3 className="font-medium text-gray-900">Personalized</h3>
                <p className="text-sm text-gray-600">Tailored to your profile and goals</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-indigo-600 text-2xl mb-2">⚡</div>
                <h3 className="font-medium text-gray-900">Instant Results</h3>
                <p className="text-sm text-gray-600">Get insights in seconds, not hours</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-green-600 text-2xl mb-2">🚀</div>
                <h3 className="font-medium text-gray-900">Career Growth</h3>
                <p className="text-sm text-gray-600">Accelerate your career development</p>
              </div>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiTools.map((tool) => (
              <div key={tool.id} className={`border rounded-lg p-6 ${getColorClasses(tool.color)} relative`}>
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className="flex items-start mb-4">
                  <div className="text-3xl mr-3">{tool.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                    <p className="text-gray-700 text-sm mb-4">{tool.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-gray-900 text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => !tool.comingSoon && setActiveTab(tool.id)}
                  disabled={tool.comingSoon}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    tool.comingSoon
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : getButtonColorClasses(tool.color)
                  }`}
                >
                  {tool.comingSoon ? 'Coming Soon' : `Try ${tool.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Your AI Journey
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Resumes Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">Career Paths Explored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Skills Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Interview Preps</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Tool Components */}
      {activeTab === 'resume' && (
        <div>
          <ResumeAnalyzer />
        </div>
      )}

      {activeTab === 'career' && (
        <div>
          <CareerGuidance />
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <SkillsGapAnalysis 
            currentSkills={user.skills || []} 
            targetRole={user.targetRole || ''} 
          />
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Preparation Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We're working on an amazing AI-powered interview preparation tool. 
            Stay tuned for personalized practice questions and feedback!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentAITools;