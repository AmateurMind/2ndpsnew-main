import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Store for created blob URLs to enable cleanup
const createdBlobUrls = new Set();

/**
 * Securely open a student's resume in a new tab
 * Uses authenticated API call and blob URLs to bypass direct link issues
 * @param {string} studentId - The ID of the student whose resume to view
 * @param {string} studentName - The name of the student (for error messages)
 * @returns {Promise<void>}
 */
export const openResumeSecurely = async (studentId, studentName = 'Student') => {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Opening resume...');
    
    try {
      // Make authenticated request to get resume PDF
      const response = await axios.get(`/resumes/${studentId}`, {
        responseType: 'blob' // Important: expect blob response
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Create blob URL from PDF response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Track created URL for cleanup
      createdBlobUrls.add(blobUrl);
      
      // Open PDF in new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        toast.error('Please allow popups to view resume');
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
        createdBlobUrls.delete(blobUrl);
        return;
      }
      
      // Clean up blob URL after a delay (when tab is likely loaded)
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        createdBlobUrls.delete(blobUrl);
      }, 60000); // 60 seconds like the certificate system
      
      toast.success('Resume opened successfully');
      
    } catch (apiError) {
      toast.dismiss(loadingToast);
      
      if (apiError.response) {
        const status = apiError.response.status;
        const errorData = apiError.response.data;
        
        switch (status) {
          case 403:
            toast.error('Access denied: You don\'t have permission to view this resume');
            break;
          case 404:
            if (errorData.error?.includes('Student not found')) {
              toast.error('Student not found');
            } else {
              toast.error(`${studentName}'s resume not found`);
            }
            break;
          case 401:
            toast.error('Please log in to view resumes');
            break;
          default:
            toast.error('Failed to load resume. Please try again.');
        }
      } else if (apiError.request) {
        toast.error('Network error: Unable to load resume');
      } else {
        toast.error('Error loading resume');
      }
      
      console.error('Resume loading error:', apiError);
    }
    
  } catch (error) {
    toast.error('Unexpected error loading resume');
    console.error('Unexpected resume error:', error);
  }
};

/**
 * Check if a student has a resume available
 * @param {string} studentId - The ID of the student
 * @returns {Promise<object>} Student info including hasResume boolean
 */
export const checkResumeAvailability = async (studentId) => {
  try {
    const response = await axios.get(`/resumes/${studentId}/info`);
    return response.data;
  } catch (error) {
    console.error('Error checking resume availability:', error);
    return { hasResume: false };
  }
};

/**
 * Create a resume button component with proper styling and security
 * @param {object} props - Component props
 * @param {string} props.studentId - Student ID
 * @param {string} props.studentName - Student name
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hasResume - Whether student has resume
 * @returns {JSX.Element}
 */
export const ResumeButton = ({ 
  studentId, 
  studentName, 
  className = '', 
  hasResume = true,
  variant = 'primary' // 'primary', 'secondary', 'outline'
}) => {
  const handleClick = () => {
    if (!hasResume) {
      toast.error(`${studentName} hasn't uploaded a resume yet`);
      return;
    }
    openResumeSecurely(studentId, studentName);
  };

  const baseClasses = 'px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-2 focus:ring-secondary-500',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500'
  };

  return (
    <button
      onClick={handleClick}
      disabled={!hasResume}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title={hasResume ? `View ${studentName}'s resume` : 'Resume not available'}
    >
      {hasResume ? 'View Resume' : 'No Resume'}
    </button>
  );
};

/**
 * Clean up all created blob URLs (call on app unmount or route changes)
 */
export const cleanupBlobUrls = () => {
  createdBlobUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdBlobUrls.clear();
};

/**
 * Hook for automatic cleanup on component unmount
 */
export const useResumeCleanup = () => {
  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      cleanupBlobUrls();
    };
  }, []);
};

const resumeViewerUtils = {
  openResumeSecurely,
  checkResumeAvailability,
  ResumeButton,
  cleanupBlobUrls,
  useResumeCleanup
};

export default resumeViewerUtils;
