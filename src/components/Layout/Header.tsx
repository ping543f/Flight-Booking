import React, { ReactNode, useRef, useState } from 'react';
import { Plane, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import defaultProfilePic from '../../assets/default-profile.png';

interface HeaderProps {
  onShowLogin: () => void;
  actions?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onShowLogin, actions }) => {
  const { currentUser, logout, setAllUsers } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    password: '',
    profilePic: currentUser?.profilePic || ''
  });
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profileForm with currentUser when currentUser changes
  React.useEffect(() => {
    setProfileForm({
      name: currentUser?.name || '',
      password: '',
      profilePic: currentUser?.profilePic || ''
    });
  }, [currentUser]);

  const handleProfileClick = () => setShowProfileMenu((v) => !v);
  const handleEditProfile = () => {
    setProfileForm({
      name: currentUser?.name || '',
      password: '',
      profilePic: currentUser?.profilePic || ''
    });
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };
  const handleProfileSave = () => {
    if (!profileForm.name) {
      setFeedback('Name is required.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setAllUsers((prev) => prev.map(u => u.id === currentUser?.id ? { ...u, name: profileForm.name, profilePic: profileForm.profilePic, ...(profileForm.password ? { password: profileForm.password } : {}) } : u));
    setShowProfileModal(false);
    setFeedback('Profile updated!');
    setTimeout(() => setFeedback(''), 2000);
  };
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileForm((f) => ({ ...f, profilePic: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg cursor-pointer" onClick={() => window.location.reload()}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div className="cursor-pointer" onClick={() => window.location.reload()}>
              <h1 className="text-xl font-bold text-gray-900">SkyBook</h1>
              <p className="text-xs text-gray-500">Flight Booking System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {actions}
            {currentUser ? (
              <div className="flex items-center space-x-3 relative">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer relative" onClick={handleProfileClick}>
                  <img
                    src={currentUser.profilePic || defaultProfilePic}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border"
                    key={currentUser.profilePic || 'default'}
                  />
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Admin</span>
                  )}
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={handleEditProfile}>Edit Profile</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}>Change Password</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={logout}>Logout</button>
                  </div>
                )}
                {/* Profile Modal */}
                {showProfileModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowProfileModal(false)} aria-label="Close">×</button>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Management</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input type="password" value={profileForm.password} onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Leave blank to keep current password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfilePicChange} className="w-full" />
                          {profileForm.profilePic && <img src={profileForm.profilePic} alt="Profile" className="w-16 h-16 rounded-full mt-2 object-cover" />}
                        </div>
                      </div>
                      {feedback && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium mt-4">{feedback}</div>}
                      <div className="mt-6 flex justify-end gap-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowProfileModal(false)}>Cancel</button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleProfileSave}>Save</button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;