'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui';
import { PencilIcon, ArrowRightIcon, InfoIcon } from '@/components/icons';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';
const GREEN = '#54bd01';

function validatePhone(value: string): string | null {
  if (!value.trim()) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return 'Enter a valid phone number';
  return null;
}

function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Enter a valid email address';
  return null;
}

function validatePassword(value: string): string | null {
  if (value.length > 0 && value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function ProfileSettingsCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Pratish Autade');
  const [displayEmail] = useState('pratishautade@gmail.com');
  const [phone, setPhone] = useState('+91 8939891524');
  const [email, setEmail] = useState('sarveshsriram19@gmail.com');
  const [company, setCompany] = useState('VECTRA International');
  const [industry, setIndustry] = useState('Automobile Manufacturing');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({
    displayName: false,
    phone: false,
    email: false,
    company: false,
    industry: false,
  });
  const setFieldEditing = (field: string, value: boolean) => {
    setEditingFields((f) => ({ ...f, [field]: value }));
  };

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
    e.target.value = '';
  }, []);

  const handleBlur = useCallback(
    (field: string, value: string) => {
      setTouched((t) => ({ ...t, [field]: true }));
      let msg: string | null = null;
      if (field === 'phone') msg = validatePhone(value);
      if (field === 'email') msg = validateEmail(value);
      if (field === 'newPassword') msg = validatePassword(value);
      if (field === 'reEnterPassword') msg = value !== newPassword ? 'Passwords do not match' : validatePassword(value);
      setErrors((e) => (msg ? { ...e, [field]: msg } : { ...e, [field]: '' }));
    },
    [newPassword]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    if (oldPassword || newPassword || reEnterPassword) {
      if (!oldPassword) newErrors.oldPassword = 'Old password is required to change password';
      const newErr = validatePassword(newPassword);
      if (newErr) newErrors.newPassword = newErr;
      if (newPassword !== reEnterPassword) newErrors.reEnterPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    setTouched({ phone: true, email: true, oldPassword: true, newPassword: true, reEnterPassword: true });
    if (Object.keys(newErrors).length === 0) {
      // Submit success – could call API here
    }
  };

  const inputBase = 'w-full border-0 border-b-2 bg-transparent py-1.5 pr-8 placeholder-gray-400 focus:outline-none focus:ring-0';
  const inputReadOnlyClass = 'text-gray-500';
  const inputEditableClass = 'text-gray-900';

  return (
    <Card className="overflow-hidden rounded-xl shadow-sm">
      <h2 className="mb-8 text-xl font-bold text-gray-900">Profile Settings</h2>

      {/* Profile header: photo + name + email */}
      <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative block rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#227B2C]"
          >
            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={DEFAULT_AVATAR}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            {/* Full-circle overlay: visible on hover, pencil + Change Photo */}
            <span className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <PencilIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              <span className="mt-1.5 text-xs font-medium text-white sm:text-sm">Change Photo</span>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
            aria-label="Upload profile photo"
          />
        </div>
        <div className="min-w-0 flex-1">
          {editingFields.displayName ? (
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={() => setFieldEditing('displayName', false)}
                autoFocus
                className={`${inputBase} text-xl font-semibold sm:text-2xl ${inputEditableClass}`}
                style={{ borderColor: GREEN }}
                placeholder="Display name"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className={`text-xl font-semibold sm:text-2xl ${inputReadOnlyClass}`}>
                {displayName}
              </p>
              <button
                type="button"
                onClick={() => setFieldEditing('displayName', true)}
                className="p-1 hover:opacity-80"
                style={{ color: GREEN }}
                aria-label="Edit display name"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Demographics */}
          <div>
            <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-gray-500">Demographics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <label htmlFor="phone" className="text-sm font-medium" style={{ color: GREEN }}>
                    Phone Number
                  </label>
                  {touched.phone && errors.phone && (
                    <span className="flex text-amber-600" title={errors.phone} aria-label={errors.phone}>
                      <InfoIcon className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="relative mt-1">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => handleBlur('phone', phone)}
                    disabled={!editingFields.phone}
                    readOnly={!editingFields.phone}
                    className={`${inputBase} ${editingFields.phone ? inputEditableClass : inputReadOnlyClass}`}
                    style={{ borderColor: touched.phone && errors.phone ? '#d97706' : GREEN }}
                    placeholder="+91 8939891524"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldEditing('phone', true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
                    style={{ color: GREEN }}
                    aria-label="Edit phone number"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-amber-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium" style={{ color: GREEN }}>
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email', email)}
                    disabled={!editingFields.email}
                    readOnly={!editingFields.email}
                    className={`${inputBase} ${editingFields.email ? inputEditableClass : inputReadOnlyClass}`}
                    style={{ borderColor: touched.email && errors.email ? '#d97706' : GREEN }}
                    placeholder="email@example.com"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldEditing('email', true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
                    style={{ color: GREEN }}
                    aria-label="Edit email"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-amber-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="company" className="text-sm font-medium" style={{ color: GREEN }}>
                  Company
                </label>
                <div className="relative mt-1">
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={!editingFields.company}
                    readOnly={!editingFields.company}
                    className={`${inputBase} ${editingFields.company ? inputEditableClass : inputReadOnlyClass}`}
                    style={{ borderColor: GREEN }}
                    placeholder="Company name"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldEditing('company', true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
                    style={{ color: GREEN }}
                    aria-label="Edit company"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="industry" className="text-sm font-medium" style={{ color: GREEN }}>
                  Industry
                </label>
                <div className="relative mt-1">
                  <input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={!editingFields.industry}
                    readOnly={!editingFields.industry}
                    className={`${inputBase} ${editingFields.industry ? inputEditableClass : inputReadOnlyClass}`}
                    style={{ borderColor: GREEN }}
                    placeholder="Industry"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldEditing('industry', true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
                    style={{ color: GREEN }}
                    aria-label="Edit industry"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-gray-500">Change Password</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="oldPassword" className="text-sm font-medium" style={{ color: GREEN }}>
                  Old Password
                </label>
                <div className="mt-1">
                  <input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, oldPassword: true }))}
                    className={`${inputBase} ${inputEditableClass}`}
                    style={{ borderColor: touched.oldPassword && errors.oldPassword ? '#d97706' : GREEN }}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {touched.oldPassword && errors.oldPassword && (
                  <p className="mt-1 text-xs text-amber-600">{errors.oldPassword}</p>
                )}
              </div>
              <div>
                <label htmlFor="newPassword" className="text-sm font-medium" style={{ color: GREEN }}>
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => handleBlur('newPassword', newPassword)}
                    className={`${inputBase} ${inputEditableClass}`}
                    style={{ borderColor: touched.newPassword && errors.newPassword ? '#d97706' : GREEN }}
                    placeholder="••••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {touched.newPassword && errors.newPassword && (
                  <p className="mt-1 text-xs text-amber-600">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <label htmlFor="reEnterPassword" className="text-sm font-medium" style={{ color: GREEN }}>
                  Re-enter New Password
                </label>
                <div className="mt-1">
                  <input
                    id="reEnterPassword"
                    type="password"
                    value={reEnterPassword}
                    onChange={(e) => setReEnterPassword(e.target.value)}
                    onBlur={() => handleBlur('reEnterPassword', reEnterPassword)}
                    className={`${inputBase} ${inputEditableClass}`}
                    style={{ borderColor: touched.reEnterPassword && errors.reEnterPassword ? '#d97706' : GREEN }}
                    placeholder="••••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {touched.reEnterPassword && errors.reEnterPassword && (
                  <p className="mt-1 text-xs text-amber-600">{errors.reEnterPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Save Changes
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </Card>
  );
}
