import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Bell, CheckCircle, Edit2, User, Camera, Heart, X, ChevronRight } from 'lucide-react';
import { logActivity } from '../lib/supabase';

const ProfilePage = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    partnerName: '',
    relationshipGoals: '',
    anniversaryDate: '',
    preferredActivities: ['communication', 'quality-time'],
    notificationPreferences: {
      dailyReminders: true,
      weeklyRecap: true,
      achievementAlerts: true,
      partnerUpdates: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'preferences', 'privacy'

  // Initialize form data with user profile info
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        partnerName: profile.partner_name || '',
        relationshipGoals: profile.relationship_goals || '',
        anniversaryDate: profile.anniversary_date || '',
        preferredActivities: profile.preferred_activities || ['communication', 'quality-time'],
        notificationPreferences: profile.notification_preferences || {
          dailyReminders: true,
          weeklyRecap: true,
          achievementAlerts: true,
          partnerUpdates: false
        }
      });
    }
  }, [profile]);

  const activityOptions = [
    { id: 'communication', label: 'Communication Exercises' },
    { id: 'quality-time', label: 'Quality Time' },
    { id: 'appreciation', label: 'Appreciation Practice' },
    { id: 'future-pacing', label: 'Future Visualization' },
    { id: 'metaphors', label: 'Relationship Metaphors' },
    { id: 'intimacy', label: 'Intimacy Building' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.startsWith('notification_')) {
      const prefName = name.replace('notification_', '');
      setFormData({
        ...formData,
        notificationPreferences: {
          ...formData.notificationPreferences,
          [prefName]: checked
        }
      });
    } else if (name.startsWith('activity_')) {
      const activityId = name.replace('activity_', '');
      let newActivities = [...formData.preferredActivities];
      
      if (checked) {
        newActivities.push(activityId);
      } else {
        newActivities = newActivities.filter(id => id !== activityId);
      }
      
      setFormData({
        ...formData,
        preferredActivities: newActivities
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Map form data to profile update format
      const profileUpdate = {
        name: formData.name,
        bio: formData.bio,
        partner_name: formData.partnerName,
        relationship_goals: formData.relationshipGoals,
        anniversary_date: formData.anniversaryDate,
        preferred_activities: formData.preferredActivities,
        notification_preferences: formData.notificationPreferences,
        updated_at: new Date().toISOString()
      };
      
      // Update profile in Supabase
      await updateProfile(profileUpdate);
      
      // Log this activity
      if (user) {
        await logActivity({
          user_id: user.id,
          type: 'profile_update',
          content_id: 'profile_edit',
          completed_at: new Date().toISOString()
        });
      }
      
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">Preparing Your Profile</h2>
        <p className="text-gray-600 max-w-md text-center">
          Just a moment while we personalize your space...
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-700">Sparq</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 px-8 flex justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  {editMode && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                      <Camera className="w-4 h-4 text-indigo-600" />
                    </button>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile?.name || user?.email?.split('@')[0]}</h2>
                  <p className="text-indigo-100">
                    Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {!editMode && (
                <button 
                  onClick={() => setEditMode(true)}
                  className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-md text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
            
            {/* Success Message */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-100 text-green-800 px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {successMessage}
                </div>
                <button onClick={() => setSuccessMessage('')}>
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preferences' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'privacy' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Privacy & Security
                </button>
              </nav>
            </div>
            
            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        disabled={!editMode}
                        className={`mt-1 block w-full rounded-md ${
                          editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                      />
                      {!editMode && !formData.name && (
                        <p className="mt-1 text-sm text-indigo-600">
                          Adding your name helps personalize your experience
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        About You
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={3}
                        disabled={!editMode}
                        className={`mt-1 block w-full rounded-md ${
                          editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Share a little about yourself"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700">
                        Partner's Name
                      </label>
                      <input
                        type="text"
                        name="partnerName"
                        id="partnerName"
                        disabled={!editMode}
                        className={`mt-1 block w-full rounded-md ${
                          editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        value={formData.partnerName}
                        onChange={handleInputChange}
                        placeholder="Enter your partner's name"
                      />
                      {!editMode && !formData.partnerName && (
                        <p className="mt-1 text-sm text-indigo-600">
                          Adding your partner's name helps personalize suggestions
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="relationshipGoals" className="block text-sm font-medium text-gray-700">
                        Relationship Goals
                      </label>
                      <textarea
                        name="relationshipGoals"
                        id="relationshipGoals"
                        rows={3}
                        disabled={!editMode}
                        className={`mt-1 block w-full rounded-md ${
                          editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        value={formData.relationshipGoals}
                        onChange={handleInputChange}
                        placeholder="What are your relationship goals?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="anniversaryDate" className="block text-sm font-medium text-gray-700">
                        Anniversary Date
                      </label>
                      <input
                        type="date"
                        name="anniversaryDate"
                        id="anniversaryDate"
                        disabled={!editMode}
                        className={`mt-1 block w-full rounded-md ${
                          editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        value={formData.anniversaryDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences-tab"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Activity Preferences</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select the types of relationship activities you prefer
                      </p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activityOptions.map((option) => (
                          <div key={option.id} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`activity_${option.id}`}
                                name={`activity_${option.id}`}
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={formData.preferredActivities.includes(option.id)}
                                onChange={handleCheckboxChange}
                                disabled={!editMode}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label 
                                htmlFor={`activity_${option.id}`} 
                                className={`font-medium ${!editMode && formData.preferredActivities.includes(option.id) ? 'text-indigo-700' : 'text-gray-700'}`}
                              >
                                {option.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose how and when you'd like to receive notifications
                      </p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="notification_dailyReminders"
                              name="notification_dailyReminders"
                              type="checkbox"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              checked={formData.notificationPreferences.dailyReminders}
                              onChange={handleCheckboxChange}
                              disabled={!editMode}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="notification_dailyReminders" className="font-medium text-gray-700">
                              Daily Activity Reminders
                            </label>
                            <p className="text-gray-500">Receive a daily reminder to engage with your relationship practice</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="notification_weeklyRecap"
                              name="notification_weeklyRecap"
                              type="checkbox"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              checked={formData.notificationPreferences.weeklyRecap}
                              onChange={handleCheckboxChange}
                              disabled={!editMode}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="notification_weeklyRecap" className="font-medium text-gray-700">
                              Weekly Progress Recap
                            </label>
                            <p className="text-gray-500">Get a summary of your relationship activities each week</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="notification_achievementAlerts"
                              name="notification_achievementAlerts"
                              type="checkbox"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              checked={formData.notificationPreferences.achievementAlerts}
                              onChange={handleCheckboxChange}
                              disabled={!editMode}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="notification_achievementAlerts" className="font-medium text-gray-700">
                              Achievement Alerts
                            </label>
                            <p className="text-gray-500">Be notified when you earn badges and reach milestones</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="notification_partnerUpdates"
                              name="notification_partnerUpdates"
                              type="checkbox"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              checked={formData.notificationPreferences.partnerUpdates}
                              onChange={handleCheckboxChange}
                              disabled={!editMode}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="notification_partnerUpdates" className="font-medium text-gray-700">
                              Partner Activity Updates
                            </label>
                            <p className="text-gray-500">Get notified when your partner completes activities (requires partner connection)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy-tab"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Control how your information is used and shared
                      </p>
                      
                      <div className="mt-5 rounded-md border border-gray-300 divide-y">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Data Collection</p>
                            <p className="text-xs text-gray-500">Allow Sparq to collect usage data to improve your experience</p>
                          </div>
                          <div className="flex items-center">
                            <button 
                              type="button"
                              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              disabled={!editMode}
                            >
                              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Profile Visibility</p>
                            <p className="text-xs text-gray-500">Make your profile visible to your partner only</p>
                          </div>
                          <div className="flex items-center">
                            <button 
                              type="button"
                              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              disabled={!editMode}
                            >
                              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Activity Sharing</p>
                            <p className="text-xs text-gray-500">Share your activity progress with your partner</p>
                          </div>
                          <div className="flex items-center">
                            <button 
                              type="button"
                              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              disabled={!editMode}
                            >
                              <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your account data and login
                      </p>
                      
                      <div className="mt-5 space-y-3">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <span className="flex items-center">
                            <Heart className="mr-2 h-5 w-5" />
                            Connect with Partner
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                        
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <span className="flex items-center">
                            <Bell className="mr-2 h-5 w-5" />
                            Test Notifications
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                        
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <span className="flex items-center">
                            <X className="mr-2 h-5 w-5" />
                            Delete Account
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {editMode && (
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
