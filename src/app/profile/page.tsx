"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Globe,
  Bell,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  KeyRound,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  timezone: string;
  deliveryNotification: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  senderName?: string | null;
  smtpEmail?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [deliveryNotification, setDeliveryNotification] = useState(true);

  // Personal sender states
  const [useCustomGmail, setUseCustomGmail] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
          setTimezone(data.user.timezone || "Asia/Dhaka");
          setDeliveryNotification(data.user.deliveryNotification ?? true);
          setSenderName(data.user.senderName || data.user.name || "");
          if (data.user.smtpEmail) {
            setUseCustomGmail(true);
            setSmtpEmail(data.user.smtpEmail);
          } else {
            setUseCustomGmail(false);
            setSmtpEmail("");
          }
          setSmtpPassword("");
        }
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setErrorMsg("");
    setSavingProfile(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim() || null,
          phone: phone.trim() || null,
          timezone,
          deliveryNotification,
          senderName,
          smtpEmail: useCustomGmail && smtpEmail ? smtpEmail.trim() : null,
          smtpPassword: useCustomGmail && smtpPassword ? smtpPassword.trim() : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.user);
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3500);
      } else {
        setErrorMsg(data.error || "Failed to update profile");
      }
    } catch {
      setErrorMsg("A network error occurred while updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setErrorMsg("");

    if (!currentPassword || !newPassword) {
      setErrorMsg("Please provide your current and new password");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg(""), 3500);
      } else {
        setErrorMsg(data.error || "Failed to change password");
      }
    } catch {
      setErrorMsg("Failed to update password. Please check your credentials.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading your profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, default timezone, and security credentials
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {profileMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{profileMsg}</span>
        </div>
      )}

      {passwordMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{passwordMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md mb-4 uppercase">
              {profile?.name.charAt(0)}
            </div>
            <h2 className="font-bold text-lg text-slate-900">{profile?.name}</h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">{profile?.email || profile?.phone}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col space-y-2 text-xs text-slate-600 text-left">
              <div className="flex items-center justify-between">
                <span>Account Status:</span>
                <span className="inline-flex items-center text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timezone:</span>
                <span className="font-semibold text-slate-800">{profile?.timezone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="+88017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Timezone (Important for Midnight Delivery)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6 - Bangladesh)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30 - India)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4 - UAE)</option>
                    <option value="Europe/London">Europe/London (GMT+0 / BST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="UTC">UTC (Universal Time)</option>
                  </select>
                </div>
              </div>

              {/* Personal Sender Configuration */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useCustomGmail}
                        onChange={(e) => {
                          setUseCustomGmail(e.target.checked);
                          if (!e.target.checked) {
                            setSmtpEmail("");
                            setSmtpPassword("");
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Send from personal Gmail (Optional)
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">
                      By default, all greetings are delivered automatically with zero setup required.
                    </p>
                  </div>
                </div>

                {!useCustomGmail ? (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block">✨ Automatic Cloud Delivery Active</span>
                      <span className="text-indigo-600 text-[11px]">
                        Wishes are delivered instantly using the server. No passwords or setup needed!
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Sender Display Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rakib Hossain"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Your Personal Gmail
                        </label>
                        <input
                          type="email"
                          autoComplete="off"
                          placeholder="yourname@gmail.com"
                          value={smtpEmail}
                          onChange={(e) => setSmtpEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Google App Password (16 characters)
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        💡 Get from: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Google Account &rarr; Security &rarr; App Passwords</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery notification preference */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryNotification}
                    onChange={(e) => setDeliveryNotification(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Send me Delivery Confirmations
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Receive an alert when your scheduled wish has been successfully delivered.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-2 text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Saving..." : "Save Preferences"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-sm flex items-center space-x-2 text-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{savingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
