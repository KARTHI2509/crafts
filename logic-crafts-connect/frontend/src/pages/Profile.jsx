import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI, uploadAPI } from '../services/api';
import { PageLoader } from '../components/Loader';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    profileImage: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user || response.data;
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
        profileImage: userData.profileImage || userData.profile_image || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use current user data as fallback
      if (user) {
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          profileImage: user.profileImage || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadAPI.profileImage(formData);
      const imageUrl = response.data.url || response.data.secure_url;
      
      setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile image uploaded!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await userAPI.updateProfile({
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        profileImage: profile.profileImage
      });
      
      // Update local user context
      if (updateUser) {
        updateUser({ ...user, ...profile });
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} />
              ) : (
                <span>{profile.name?.charAt(0)?.toUpperCase() || '👤'}</span>
              )}
              <label className="avatar-upload-btn">
                {uploadingImage ? '...' : '📷'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  hidden
                />
              </label>
            </div>
            <div className="profile-info">
              <h1>{profile.name}</h1>
              <p className="profile-role">
                <span className="role-badge">{user?.role}</span>
              </p>
              <p className="profile-email">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="disabled"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleProfileChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="security-form">
              <h3>Change Password</h3>
              <p className="security-info">
                Ensure your account is using a strong password for security.
              </p>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <small>Minimum 8 characters with uppercase, lowercase, and number</small>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Updating...' : '🔐 Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: calc(100vh - 160px);
          padding: 24px 16px;
          background: var(--bg-cream, #faf8f4);
        }

        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow-lg, 0 8px 24px rgba(89,67,53,0.12));
          overflow: hidden;
        }

        .profile-header {
          background: linear-gradient(135deg, var(--primary, #8b5a2b), var(--accent, #d4a574));
          padding: 32px;
          color: white;
        }

        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .profile-avatar {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 600;
          overflow: hidden;
          border: 3px solid white;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }

        .avatar-upload-btn:hover {
          transform: scale(1.1);
        }

        .profile-info h1 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .role-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-email {
          margin-top: 8px;
          opacity: 0.9;
          font-size: 14px;
        }

        .profile-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          font-size: 15px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: var(--primary, #8b5a2b);
          background: var(--bg-cream, #faf8f4);
        }

        .tab.active {
          color: var(--primary, #8b5a2b);
          border-bottom-color: var(--primary, #8b5a2b);
          font-weight: 600;
        }

        .profile-content {
          padding: 32px;
        }

        .profile-form, .security-form {
          max-width: 100%;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text, #1f2937);
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary, #8b5a2b);
          box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
        }

        .form-group input.disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          margin-top: 6px;
          color: #9ca3af;
          font-size: 12px;
        }

        .security-form h3 {
          margin: 0 0 8px;
          color: var(--text, #1f2937);
        }

        .security-info {
          margin-bottom: 24px;
          color: #6b7280;
          font-size: 14px;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: var(--primary, #8b5a2b);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--primary-light, #a67c52);
          transform: translateY(-2px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .profile-avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .profile-content {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
