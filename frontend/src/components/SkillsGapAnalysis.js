import React, { useState } from 'react';
import { Target, BookOpen, Clock, Star, TrendingUp, AlertTriangle, Plus, X } from 'lucide-react';
import aiService from '../utils/aiService';
import toast from 'react-hot-toast';

const SkillsGapAnalysis = ({ className = '', currentSkills = [], targetRole = '' }) => {
  const [mySkills, setMySkills] = useState(currentSkills);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('gemini');

  const addSkill = (skillList, setSkillList, skill) => {
    if (skill.trim() && !skillList.includes(skill.trim())) {
      setSkillList([...skillList, skill.trim()]);
      return true;
    }
    return false;
  };

  const removeSkill = (skillList, setSkillList, skillToRemove) => {
    setSkillList(skillList.filter(skill => skill !== skillToRemove));
  };

  const handleAddMySkill = () => {
    if (addSkill(mySkills, setMySkills, newSkill)) {
      setNewSkill('');
    }
  };

  const handleAddRequiredSkill = () => {
    if (addSkill(requiredSkills, setRequiredSkills, newRequiredSkill)) {
      setNewRequiredSkill('');
    }
  };

  const handleAnalyze = async () => {
    if (mySkills.length === 0) {
      toast.error('Please add at least one current skill');
      return;
    }

    if (requiredSkills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    try {
      setLoading(true);
      const result = await aiService.analyzeSkillsGap(mySkills, requiredSkills, provider);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Skills gap analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  const SkillTag = ({ skill, onRemove, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color]}`}>
        {skill}
        {onRemove && (
          <button
            onClick={() => onRemove(skill)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  };

  const SkillInput = ({ value, setValue, onAdd, placeholder, buttonText }) => (
    <div className="flex space-x-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
      />
      <button
        onClick={onAdd}
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  const LearningPathCard = ({ skill }) => {
    const getPriorityColor = (level) => {
      switch (level.toLowerCase()) {
        case 'critical': return 'border-red-200 bg-red-50';
        case 'important': return 'border-yellow-200 bg-yellow-50';
        case 'beneficial': return 'border-green-200 bg-green-50';
        default: return 'border-blue-200 bg-blue-50';
      }
    };

    return (
      <div className={`border rounded-lg p-4 ${getPriorityColor('important')}`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">{skill.currentLevel}</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-900 font-medium">{skill.targetLevel}</span>
          </div>
        </div>

        {skill.estimatedTime && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Clock className="w-4 h-4 mr-2" />
            <span>Estimated time: {skill.estimatedTime}</span>
          </div>
        )}

        {skill.resources?.length > 0 && (
          <div className="mb-3">
            <h5 className="font-medium text-gray-800 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources
            </h5>
            <ul className="space-y-1">
              {skill.resources.slice(0, 3).map((resource, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {resource}
                </li>
              ))}
            </ul>
          </div>
        )}

        {skill.projects?.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-800 mb-2">💡 Practice Projects</h5>
            <ul className="space-y-1">
              {skill.projects.slice(0, 2).map((project, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  {project}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Target className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">AI Skills Gap Analysis</h2>
      </div>

      {!analysis ? (
        <div className="space-y-6">
          {/* Current Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Current Skills
            </label>
            <SkillInput
              value={newSkill}
              setValue={setNewSkill}
              onAdd={handleAddMySkill}
              placeholder="Add a skill you have (e.g., JavaScript, Python)"
              buttonText="Add"
            />
            {mySkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {mySkills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    color="blue"
                    onRemove={(skill) => removeSkill(mySkills, setMySkills, skill)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Required Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Skills Required for Target Role {targetRole && `(${targetRole})`}
            </label>
            <SkillInput
              value={newRequiredSkill}
              setValue={setNewRequiredSkill}
              onAdd={handleAddRequiredSkill}
              placeholder="Add a required skill (e.g., React, Machine Learning)"
              buttonText="Add"
            />
            {requiredSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    color="red"
                    onRemove={(skill) => removeSkill(requiredSkills, setRequiredSkills, skill)}
                  />
                ))}
              </div>
            )}
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
              <option value="gemini">Google Gemini (Recommended for Skills Analysis)</option>
              <option value="openai">OpenAI ChatGPT</option>
            </select>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || mySkills.length === 0 || requiredSkills.length === 0}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Analyzing Skills Gap...' : 'Analyze Skills Gap'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Skills Gap Analysis Results</h3>
            <button
              onClick={clearAnalysis}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              New Analysis
            </button>
          </div>

          {/* Overall Readiness Score */}
          {analysis.overallReadiness && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analysis.overallReadiness}%
              </div>
              <div className="text-gray-700 font-medium">Overall Readiness</div>
              <div className="text-sm text-gray-600 mt-2">
                {analysis.overallReadiness >= 80 ? 'You\'re well-prepared!' : 
                 analysis.overallReadiness >= 60 ? 'Good foundation, some gaps to fill' : 
                 'Significant skill development needed'}
              </div>
            </div>
          )}

          {/* Gap Analysis */}
          {analysis.gapAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.gapAnalysis.matchingSkills?.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Skills You Have
                  </h4>
                  <div className="space-y-2">
                    {analysis.gapAnalysis.matchingSkills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} color="green" />
                    ))}
                  </div>
                </div>
              )}

              {analysis.gapAnalysis.partialSkills?.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Skills to Improve
                  </h4>
                  <div className="space-y-2">
                    {analysis.gapAnalysis.partialSkills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} color="yellow" />
                    ))}
                  </div>
                </div>
              )}

              {analysis.gapAnalysis.missingSkills?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Skills to Learn
                  </h4>
                  <div className="space-y-2">
                    {analysis.gapAnalysis.missingSkills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} color="red" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Priority Levels */}
          {analysis.priorityLevels && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Learning Priorities</h4>
              <div className="space-y-4">
                {analysis.priorityLevels.critical?.length > 0 && (
                  <div className="border-l-4 border-red-400 pl-4">
                    <h5 className="font-medium text-red-800 mb-2">🔴 Critical (Start Now)</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.priorityLevels.critical.map((skill, index) => (
                        <SkillTag key={index} skill={skill} color="red" />
                      ))}
                    </div>
                  </div>
                )}

                {analysis.priorityLevels.important?.length > 0 && (
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <h5 className="font-medium text-yellow-800 mb-2">🟡 Important (Next 3-6 months)</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.priorityLevels.important.map((skill, index) => (
                        <SkillTag key={index} skill={skill} color="yellow" />
                      ))}
                    </div>
                  </div>
                )}

                {analysis.priorityLevels.beneficial?.length > 0 && (
                  <div className="border-l-4 border-green-400 pl-4">
                    <h5 className="font-medium text-green-800 mb-2">🟢 Beneficial (Long-term)</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.priorityLevels.beneficial.map((skill, index) => (
                        <SkillTag key={index} skill={skill} color="green" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {analysis.learningPath?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Personalized Learning Path</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {analysis.learningPath.map((skill, index) => (
                  <LearningPathCard key={index} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Analysis Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.gapAnalysis?.matchingSkills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Skills Match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {analysis.gapAnalysis?.partialSkills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Need Improvement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {analysis.gapAnalysis?.missingSkills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Skills to Learn</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.learningPath?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Learning Paths</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsGapAnalysis;