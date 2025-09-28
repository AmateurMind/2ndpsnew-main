import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Building, Send } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: '' });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await axios.get('/internships?recommended=true');
      setInternships(response.data.internships);
    } catch (error) {
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internship) => {
    if (internship.hasApplied || !internship.isEligible) {
      return; // Don't open modal for already applied or ineligible internships
    }
    setSelectedInternship(internship);
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    try {
      await axios.post('/applications', {
        internshipId: selectedInternship.id,
        coverLetter: applicationData.coverLetter
      });
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationData({ coverLetter: '' });
      
      // Update the local state to reflect the applied status
      setInternships(prev => prev.map(internship => 
        internship.id === selectedInternship.id 
          ? { ...internship, hasApplied: true }
          : internship
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-8">Available Internships</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <div key={internship.id} className="card p-6 group hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <img 
                src={internship.companyLogo} 
                alt={internship.company}
                className="h-12 w-12 rounded-lg"
              />
              {internship.recommendationScore && (
                <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Star className="h-3 w-3 mr-1" />
                  {internship.recommendationScore}% Match
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
              {internship.title}
            </h3>
            <p className="text-sm text-secondary-600 mb-4 flex items-center">
              <Building className="h-4 w-4 mr-1" />
              {internship.company}
            </p>
            
            <div className="space-y-2 text-sm text-secondary-500 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {internship.location}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                {internship.stipend}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {internship.duration}
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4">
              {internship.description.substring(0, 100)}...
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {internship.requiredSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {internship.requiredSkills.length > 3 && (
                <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                  +{internship.requiredSkills.length - 3} more
                </span>
              )}
            </div>

            <button 
              onClick={() => handleApply(internship)}
              className={`w-full flex items-center justify-center ${
                internship.hasApplied 
                  ? 'btn-success cursor-not-allowed' 
                  : internship.isEligible 
                    ? 'btn-primary' 
                    : 'btn-disabled cursor-not-allowed'
              }`}
              disabled={!internship.isEligible || internship.hasApplied}
            >
              <Send className="h-4 w-4 mr-2" />
              {internship.hasApplied 
                ? 'Applied' 
                : internship.isEligible 
                  ? 'Apply Now' 
                  : 'Not Eligible'
              }
            </button>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Apply for {selectedInternship?.title}</h3>
            <textarea
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({ coverLetter: e.target.value })}
              placeholder="Write a cover letter explaining why you're interested in this internship..."
              className="w-full h-32 p-3 border border-secondary-300 rounded-lg resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={submitApplication}
                className="btn-primary flex-1"
                disabled={!applicationData.coverLetter.trim()}
              >
                Submit Application
              </button>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInternships;