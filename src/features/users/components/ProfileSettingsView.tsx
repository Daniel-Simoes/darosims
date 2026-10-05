import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from '../../../lib/api';
import { PERMISSION_LABELS } from '../../../lib/permissions/permissionLabels';
import { useAuth } from '../../../context/AuthContext';
import type { UserProfile } from '../../../types/auth';
import './ProfileSettingsView.css';

interface ProfileSettingsViewProps {
  onBack: () => void;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function getInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || 'U';
}

export function ProfileSettingsView({ onBack }: ProfileSettingsViewProps) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const { profile: loadedProfile } = await api.getProfile();
        if (cancelled) return;
        setProfile(loadedProfile);
        setForm({
          firstName: loadedProfile.firstName,
          lastName: loadedProfile.lastName,
          email: loadedProfile.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPhotoPreview(loadedProfile.photoUrl ?? null);
        setPhotoChanged(false);
        setRemovePhoto(false);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load profile');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  function handleFieldChange(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(null);
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo must be 2 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null);
      setPhotoChanged(true);
      setRemovePhoto(false);
      setError(null);
      setSuccess(null);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoPreview(null);
    setPhotoChanged(true);
    setRemovePhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleCancel() {
    if (!profile) {
      onBack();
      return;
    }

    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPhotoPreview(profile.photoUrl ?? null);
    setPhotoChanged(false);
    setRemovePhoto(false);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    const wantsPasswordChange = Boolean(form.newPassword.trim() || form.confirmPassword.trim());
    if (wantsPasswordChange) {
      if (!form.currentPassword.trim()) {
        setError('Current password is required to change your password.');
        return;
      }
      if (form.newPassword.trim().length < 4) {
        setError('New password must be at least 4 characters.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        ...(wantsPasswordChange
          ? {
              currentPassword: form.currentPassword,
              newPassword: form.newPassword,
            }
          : {}),
        ...(photoChanged
          ? {
              photoDataUrl: removePhoto ? null : photoPreview,
            }
          : {}),
      };

      const { profile: updatedProfile } = await api.updateProfile(payload);
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setPhotoPreview(updatedProfile.photoUrl ?? null);
      setPhotoChanged(false);
      setRemovePhoto(false);
      setForm((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  const initials = getInitials(form.firstName, form.lastName);
  const permissions = profile?.permissions ?? user?.permissions ?? [];

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-topbar">
          <button type="button" className="profile-back-btn" onClick={onBack} aria-label="Go back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        </div>

        {error && <div className="profile-alert profile-alert-error">{error}</div>}
        {success && <div className="profile-alert profile-alert-success">{success}</div>}

        {isLoading ? (
          <div className="profile-loading">Loading profile...</div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
          <section className="profile-card">
            <h2 className="profile-section-title">Profile photo</h2>
            <div className="profile-photo-row">
              <div className="profile-photo-preview">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="profile-photo-image" />
                ) : (
                  <span className="profile-photo-fallback">{initials}</span>
                )}
              </div>
              <div className="profile-photo-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="profile-photo-input"
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  className="profile-btn profile-btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change photo
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    className="profile-btn profile-btn-ghost"
                    onClick={handleRemovePhoto}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="profile-card">
            <h2 className="profile-section-title">Personal information</h2>
            <div className="profile-grid">
              <label className="profile-field">
                <span>First name</span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(event) => handleFieldChange('firstName', event.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className="profile-field">
                <span>Last name</span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(event) => handleFieldChange('lastName', event.target.value)}
                  autoComplete="family-name"
                />
              </label>
              <label className="profile-field profile-field-full">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  autoComplete="email"
                />
              </label>
            </div>
          </section>

          <section className="profile-card">
            <h2 className="profile-section-title">Change password</h2>
            <p className="profile-section-desc">
              Leave blank if you do not want to change your password.
            </p>
            <div className="profile-grid">
              <label className="profile-field profile-field-full">
                <span>Current password</span>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) => handleFieldChange('currentPassword', event.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className="profile-field">
                <span>New password</span>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => handleFieldChange('newPassword', event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label className="profile-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </div>
          </section>

          <section className="profile-card">
            <h2 className="profile-section-title">Permissions</h2>
            <p className="profile-section-desc">
              Your current role permissions. These are managed by your organization administrator.
            </p>
            <div className="profile-permissions">
              {permissions.map((permission) => (
                <label key={permission} className="profile-permission-item">
                  <input type="checkbox" checked readOnly disabled />
                  <span>{PERMISSION_LABELS[permission]}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-btn profile-btn-outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="profile-btn profile-btn-primary" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update'}
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
}
