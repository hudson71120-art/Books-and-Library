import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, AlertCircle, Trash2, Upload } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=AD2600',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Clara',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Archivist',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ReaderZen',
  'https://api.dicebear.com/7.x/bottts/svg?seed=BookWorm99',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, signOut, validateMatchingEmails, isAdmin } = useAuth();

  if (!isOpen || !user) return null;

  const [username, setUsername] = useState(user.username);
  const [bookClubEmail, setBookClubEmail] = useState(user.bookClubEmail);
  const [libraryEmail, setLibraryEmail] = useState(user.libraryEmail);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio);
  const [favoriteGenre, setFavoriteGenre] = useState(user.favoriteGenre);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const mailValidation = validateMatchingEmails(bookClubEmail, libraryEmail);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAvatarUrl.trim()) return;
    setAvatarUrl(customAvatarUrl.trim());
    setFeedbackNotice({ type: 'success', message: 'Custom image URL applied to avatar!' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackNotice({
        type: 'error',
        message: 'File size exceeds 5MB limit. Please select a smaller image.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setFeedbackNotice({ type: 'success', message: 'Photo uploaded successfully!' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackNotice(null);

    // Enforce Mail Validation check
    if (!mailValidation.isValid) {
      setFeedbackNotice({
        type: 'error',
        message: mailValidation.message,
      });
      return;
    }

    const success = updateProfile({
      username: username.trim(),
      bookClubEmail: bookClubEmail.trim().toLowerCase(),
      libraryEmail: libraryEmail.trim().toLowerCase(),
      avatarUrl,
      bio: bio.trim(),
      favoriteGenre,
    });

    if (success) {
      setFeedbackNotice({ type: 'success', message: 'Profile changes saved successfully!' });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setFeedbackNotice({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 sticky top-0 bg-white z-10">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Account Settings</span>
            <h3 className="text-base font-serif font-bold text-stone-900">Reader Profile Configuration</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {feedbackNotice && (
            <div
              className={`p-3 rounded flex items-start gap-2 ${
                feedbackNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackNotice.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedbackNotice.message}</span>
            </div>
          )}

          {/* User Statistics Summary Cards (Specification Section 8.2) */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block mb-2">
              User Statistics Summary Cards
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-center">
                <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                  CLUBS
                </span>
                <span className="text-xl font-serif font-bold text-stone-900 tabular-nums my-0.5 block">
                  {user.clubsCount}
                </span>
                <span className="text-[10px] text-stone-400 block truncate">
                  Total joined clubs
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-center">
                <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                  COMPLETED
                </span>
                <span className="text-xl font-serif font-bold text-stone-900 tabular-nums my-0.5 block">
                  {user.completedBooksCount}
                </span>
                <span className="text-[10px] text-stone-400 block truncate">
                  Completed books
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-center">
                <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                  CHAPTERS
                </span>
                <span className="text-xl font-serif font-bold text-stone-900 tabular-nums my-0.5 block">
                  {user.chaptersReadCount}
                </span>
                <span className="text-[10px] text-stone-400 block truncate">
                  Chapters read
                </span>
              </div>
            </div>
          </div>

          {/* Reader Avatar (Profile Picture) Management (Specification Section 8.2) */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block mb-2">
              Reader Avatar (Robot / Character Style)
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full border-2 border-stone-300 bg-white object-cover shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                  className="absolute -bottom-1 -right-1 p-1 bg-white border border-stone-300 hover:border-rose-400 hover:text-rose-600 rounded-full shadow-xs transition-colors cursor-pointer"
                  title="Remove / Reset picture (Trash icon)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 flex-1 w-full text-xs">
                {/* 1. Upload Photo & Remove */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded text-xs cursor-pointer font-medium transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <span>Upload Photo (JPG, PNG, WebP ≤ 5MB)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                    title="Delete / Remove picture"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* 2. Image URL Input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Image URL: paste direct image link..."
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-2.5 py-1 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded transition-colors cursor-pointer shrink-0"
                  >
                    Apply URL
                  </button>
                </div>

                {/* 3. Presets */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-stone-500 font-medium">Presets:</span>
                  <div className="flex gap-1.5">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform cursor-pointer bg-white ${
                          avatarUrl === preset ? 'border-stone-900 scale-110 shadow-xs' : 'border-stone-300 hover:border-stone-500'
                        }`}
                        title={`Select robot preset #${idx + 1}`}
                      >
                        <img src={preset} alt={`preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details & Pseudonym */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Display Name / Reader Pseudonym
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Account Synchronization (v1.30.0) */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-stone-700 font-semibold flex items-center gap-1.5">
                <span>Account Synchronization</span>
                <span className="text-stone-400 font-normal font-mono">(v1.30.0)</span>
              </span>

              {mailValidation.isValid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3" />
                  ✓ Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3 h-3" />
                  Unsynced
                </span>
              )}
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1 text-[11px]">
                Book Club Email
              </label>
              <input
                type="email"
                required
                disabled={isAdmin}
                value={bookClubEmail}
                onChange={(e) => setBookClubEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 disabled:bg-stone-100 disabled:text-stone-600"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1 text-[11px]">
                Open Library Email
              </label>
              <input
                type="email"
                required
                disabled={isAdmin}
                value={libraryEmail}
                onChange={(e) => setLibraryEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 disabled:bg-stone-100 disabled:text-stone-600"
              />
            </div>

            {/* Validation Note (Strictly as specified in prompt section 8.2) */}
            <p className="text-[11px] text-stone-600 leading-snug">
              <strong className="text-stone-800">Validation Note:</strong>{' '}
              {mailValidation.isValid
                ? 'Matching Mail Validated. Borrowing status & Open Library sync enabled.'
                : 'Mail mismatch: Book Club Mail and Library Mail must match to enable borrowing status & sync.'}
            </p>
          </div>

          {/* Preferences & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Favorite Genre</label>
              <select
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 bg-white"
              >
                <option value="Sci-Fi & Speculative">Sci-Fi & Speculative</option>
                <option value="Literary & Historical">Literary & Historical</option>
                <option value="Poetry & Archival">Poetry & Archival</option>
                <option value="Philosophical Prose">Philosophical Prose</option>
                <option value="Contemporary Fiction">Contemporary Fiction</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Reader Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="text-xs text-rose-700 hover:text-rose-900 font-medium"
            >
              Log Out of Account
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
