import React, { useState } from 'react';
import { Compass, TrendingUp, BookOpen, Users, Lightbulb, Calendar, ExternalLink } from 'lucide-react';
import aiService from '../utils/aiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CareerGuidance = ({ studentProfile = null, className = '' }) => {
  const { user } = useAuth();
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('openai');

  // Use provided profile or create one from user data
  const getStudentProfile = () => {
    if (studentProfile) return studentProfile;
    
    if (user) {
      return {
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        skills: user.skills || [],
        interests: user.interests || [],
        experience: user.experience || [],
        education: user.education || [],
        gpa: user.gpa
      };
    }
    
    return null;
  };

  const handleGenerateGuidance = async () => {
    const profile = getStudentProfile();
    
    if (!profile) {
      toast.error('Student profile not available');
      return;
    }

    try {
      setLoading(true);
      const result = await aiService.generateCareerGuidance(profile, provider);
      setGuidance(result.guidance);
    } catch (error) {
      console.error('Career guidance generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const CareerPathCard = ({ path }) => {
    const getMatchColor = (score) => {
      if (score >= 80) return 'text-green-600 bg-green-100';
      if (score >= 60) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900">{path.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(path.matchScore)}`}>
            {path.matchScore}% match
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{path.description}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
            <span className="font-medium">Growth:</span>
            <span className="ml-2 text-gray-600">{path.growthProspects}</span>
          </div>
          
          {path.averageSalary && (
            <div className="flex items-center text-sm">
              <span className="font-medium">Avg. Salary:</span>
              <span className="ml-2 text-gray-600">{path.averageSalary}</span>
            </div>
          )}
        </div>

        {path.requiredSkills?.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Required Skills:</div>
            <div className="flex flex-wrap gap-1">
              {path.requiredSkills.slice(0, 5).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {skill}
                </span>
              ))}
              {path.requiredSkills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{path.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {path.steps?.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Next Steps:</div>
            <ul className="text-xs text-gray-600 space-y-1">
              {path.steps.slice(0, 3).map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const GoalsList = ({ goals, title, icon: Icon, bgColor = 'bg-blue-50', textColor = 'text-blue-800' }) => (
    <div className={`${bgColor} rounded-lg p-4`}>
      <h4 className={`font-semibold ${textColor} mb-3 flex items-center`}>
        <Icon className="w-4 h-4 mr-2" />
        {title}
      </h4>
      <ul className="space-y-2">
        {goals?.map((goal, index) => (
          <li key={index} className={`text-sm ${textColor} flex items-start`}>
            <span className="mr-2">•</span>
            {goal}
          </li>
        ))}
      </ul>
    </div>
  );

  const ResourceSection = ({ resources }) => (
    <div className="space-y-4">
      {resources?.courses?.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Recommended Courses
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {resources.courses.map((course, index) => (
              <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                {course}
              </div>
            ))}
          </div>
        </div>
      )}

      {resources?.books?.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">📚 Reading List</h5>
          <ul className="space-y-1">
            {resources.books.map((book, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                {book}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resources?.websites?.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Useful Websites
          </h5>
          <div className="space-y-1">
            {resources.websites.map((website, index) => (
              <div key={index} className="text-sm text-blue-600">
                {website}
              </div>
            ))}
          </div>
        </div>
      )}

      {resources?.tools?.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">🛠️ Tools to Learn</h5>
          <div className="flex flex-wrap gap-2">
            {resources.tools.map((tool, index) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const profile = getStudentProfile();

  if (!profile) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <Compass className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Career Guidance Unavailable</h3>
          <p>Student profile information is required to generate career guidance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Compass className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">AI Career Guidance</h2>
        </div>
        
        {!guidance && (
          <div className="flex items-center space-x-3">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="openai">ChatGPT</option>
              <option value="gemini">Gemini</option>
            </select>
            <button
              onClick={handleGenerateGuidance}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Get Guidance'}
            </button>
          </div>
        )}
      </div>

      {!guidance ? (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready for AI-Powered Career Guidance?</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get personalized career recommendations based on your profile, skills, and interests using advanced AI.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">Your Profile Summary:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><span className="font-medium">Name:</span> {profile.name}</div>
              {profile.department && <div><span className="font-medium">Department:</span> {profile.department}</div>}
              {profile.year && <div><span className="font-medium">Year:</span> {profile.year}</div>}
              {profile.skills?.length > 0 && <div><span className="font-medium">Skills:</span> {profile.skills.slice(0, 3).join(', ')}{profile.skills.length > 3 && '...'}</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Career Paths */}
          {guidance.careerPaths?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Career Paths</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidance.careerPaths.map((path, index) => (
                  <CareerPathCard key={index} path={path} />
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Development Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidance.strengths?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Your Strengths
                </h4>
                <ul className="space-y-2">
                  {guidance.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.developmentAreas?.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Areas to Develop
                </h4>
                <ul className="space-y-2">
                  {guidance.developmentAreas.map((area, index) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidance.shortTermGoals?.length > 0 && (
              <GoalsList
                goals={guidance.shortTermGoals}
                title="Short-term Goals (3-6 months)"
                icon={Calendar}
                bgColor="bg-blue-50"
                textColor="text-blue-800"
              />
            )}

            {guidance.longTermGoals?.length > 0 && (
              <GoalsList
                goals={guidance.longTermGoals}
                title="Long-term Goals (1-2 years)"
                icon={TrendingUp}
                bgColor="bg-purple-50"
                textColor="text-purple-800"
              />
            )}
          </div>

          {/* Industry Trends */}
          {guidance.industryTrends?.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Industry Trends to Watch
              </h4>
              <ul className="space-y-2">
                {guidance.industryTrends.map((trend, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-indigo-500 mr-2">▶</span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Networking */}
          {guidance.networking && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Networking Strategy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guidance.networking.events?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-indigo-700 mb-2">Events to Attend</h5>
                    <ul className="space-y-1">
                      {guidance.networking.events.map((event, index) => (
                        <li key={index} className="text-sm text-indigo-600">• {event}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {guidance.networking.platforms?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-indigo-700 mb-2">Platforms</h5>
                    <ul className="space-y-1">
                      {guidance.networking.platforms.map((platform, index) => (
                        <li key={index} className="text-sm text-indigo-600">• {platform}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {guidance.networking.people?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-indigo-700 mb-2">People to Connect</h5>
                    <ul className="space-y-1">
                      {guidance.networking.people.map((person, index) => (
                        <li key={index} className="text-sm text-indigo-600">• {person}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {guidance.resources && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Learning Resources
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <ResourceSection resources={guidance.resources} />
              </div>
            </div>
          )}

          {/* New Guidance Button */}
          <div className="text-center pt-6 border-t">
            <button
              onClick={() => setGuidance(null)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Generate New Guidance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerGuidance;