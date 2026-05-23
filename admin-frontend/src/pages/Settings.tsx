import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Settings as SettingsIcon, Coins, Calendar, Shield, Mail, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { settingsApi } from '../services/api';

type SettingsTab = 'general' | 'tokens' | 'sessions' | 'security' | 'email' | 'gamification';

const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const labelCls = 'block text-[12px] font-medium text-fg-2 mb-1.5';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string, data: any) => {
    setSaving(true);
    try {
      switch (category) {
        case 'general': await settingsApi.updateGeneralSettings(data); break;
        case 'tokens': await settingsApi.updateTokenSettings(data); break;
        case 'sessions': await settingsApi.updateSessionSettings(data); break;
        case 'security': await settingsApi.updateSecuritySettings(data); break;
        case 'email': await settingsApi.updateEmailSettings(data); break;
        case 'gamification': await settingsApi.updateGamificationSettings(data); break;
      }
      toast.success('Settings saved');
      await fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (category: string) => {
    if (!confirm(`Reset ${category} settings to defaults?`)) return;
    try {
      await settingsApi.resetSettings(category);
      toast.success('Settings reset to defaults');
      await fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset settings');
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'gamification', label: 'Gamification', icon: Gamepad2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-edge border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="bg-panel border border-edge rounded-xl overflow-hidden">
        <div className="flex border-b border-edge overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                activeTab === id ? 'text-accent border-b-2 border-accent' : 'text-fg-3 hover:text-fg-1'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && <GeneralSettings settings={settings?.general} onSave={(d) => handleSave('general', d)} onReset={() => handleReset('general')} saving={saving} />}
          {activeTab === 'tokens' && <TokenSettings settings={settings?.tokens} onSave={(d) => handleSave('tokens', d)} onReset={() => handleReset('tokens')} saving={saving} />}
          {activeTab === 'sessions' && <SessionSettings settings={settings?.sessions} onSave={(d) => handleSave('sessions', d)} onReset={() => handleReset('sessions')} saving={saving} />}
          {activeTab === 'security' && <SecuritySettings settings={settings?.security} onSave={(d) => handleSave('security', d)} onReset={() => handleReset('security')} saving={saving} />}
          {activeTab === 'email' && <EmailSettings settings={settings?.email} onSave={(d) => handleSave('email', d)} onReset={() => handleReset('email')} saving={saving} />}
          {activeTab === 'gamification' && <GamificationSettings settings={settings?.gamification} onSave={(d) => handleSave('gamification', d)} onReset={() => handleReset('gamification')} saving={saving} />}
        </div>
      </div>
    </div>
  );
};

type SectionProps = { children: React.ReactNode; onSave: () => void; onReset: () => void; saving: boolean };

const SettingsSection: React.FC<SectionProps> = ({ children, onSave, onReset, saving }) => (
  <div className="space-y-5">
    {children}
    <div className="flex justify-end gap-2 pt-4 border-t border-edge">
      <Button variant="secondary" icon={RefreshCw} onClick={onReset}>Reset to Defaults</Button>
      <Button icon={Save} onClick={onSave} loading={saving}>Save Changes</Button>
    </div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const GeneralSettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Platform Name">
          <input type="text" value={data.platformName || ''} onChange={(e) => setData({ ...data, platformName: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Support Email">
          <input type="email" value={data.supportEmail || ''} onChange={(e) => setData({ ...data, supportEmail: e.target.value })} className={inputCls} />
        </Field>
        <div className="col-span-2">
          <Field label="Platform Description">
            <textarea value={data.platformDescription || ''} onChange={(e) => setData({ ...data, platformDescription: e.target.value })} rows={3} className={textareaCls} />
          </Field>
        </div>
        <div className="col-span-2 flex items-center gap-2.5">
          <input type="checkbox" id="maintenance" checked={data.maintenanceMode || false} onChange={(e) => setData({ ...data, maintenanceMode: e.target.checked })} className="w-4 h-4 rounded border-edge accent-accent" />
          <label htmlFor="maintenance" className="text-[13px] text-fg-2">Enable Maintenance Mode</label>
        </div>
      </div>
    </SettingsSection>
  );
};

const TokenSettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Welcome Bonus"><input type="number" value={data.welcomeBonus || 0} onChange={(e) => setData({ ...data, welcomeBonus: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Referral Bonus"><input type="number" value={data.referralBonus || 0} onChange={(e) => setData({ ...data, referralBonus: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Min Token Rate"><input type="number" value={data.minTokenRate || 0} onChange={(e) => setData({ ...data, minTokenRate: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Max Token Rate"><input type="number" value={data.maxTokenRate || 0} onChange={(e) => setData({ ...data, maxTokenRate: parseInt(e.target.value) })} className={inputCls} /></Field>
      </div>
    </SettingsSection>
  );
};

const SessionSettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Min Session Duration (min)"><input type="number" value={data.minSessionDuration || 0} onChange={(e) => setData({ ...data, minSessionDuration: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Max Session Duration (min)"><input type="number" value={data.maxSessionDuration || 0} onChange={(e) => setData({ ...data, maxSessionDuration: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Cancellation Penalty (%)"><input type="number" value={data.cancellationPenalty || 0} onChange={(e) => setData({ ...data, cancellationPenalty: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Max Active Bookings"><input type="number" value={data.maxActiveBookings || 0} onChange={(e) => setData({ ...data, maxActiveBookings: parseInt(e.target.value) })} className={inputCls} /></Field>
      </div>
    </SettingsSection>
  );
};

const SecuritySettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Max Login Attempts"><input type="number" value={data.maxLoginAttempts || 0} onChange={(e) => setData({ ...data, maxLoginAttempts: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Lockout Duration (min)"><input type="number" value={data.lockoutDuration || 0} onChange={(e) => setData({ ...data, lockoutDuration: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="Password Min Length"><input type="number" value={data.passwordMinLength || 0} onChange={(e) => setData({ ...data, passwordMinLength: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="OTP Expiry (min)"><input type="number" value={data.otpExpiry || 0} onChange={(e) => setData({ ...data, otpExpiry: parseInt(e.target.value) })} className={inputCls} /></Field>
      </div>
    </SettingsSection>
  );
};

const EmailSettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <Field label="SMTP Host"><input type="text" value={data.smtpHost || ''} onChange={(e) => setData({ ...data, smtpHost: e.target.value })} className={inputCls} /></Field>
        <Field label="SMTP Port"><input type="number" value={data.smtpPort || 0} onChange={(e) => setData({ ...data, smtpPort: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="From Email"><input type="email" value={data.fromEmail || ''} onChange={(e) => setData({ ...data, fromEmail: e.target.value })} className={inputCls} /></Field>
        <Field label="From Name"><input type="text" value={data.fromName || ''} onChange={(e) => setData({ ...data, fromName: e.target.value })} className={inputCls} /></Field>
      </div>
    </SettingsSection>
  );
};

const GamificationSettings: React.FC<{ settings: any; onSave: (d: any) => void; onReset: () => void; saving: boolean }> = ({ settings, onSave, onReset, saving }) => {
  const [data, setData] = useState(settings || {});
  useEffect(() => { setData(settings || {}); }, [settings]);
  return (
    <SettingsSection onSave={() => onSave(data)} onReset={onReset} saving={saving}>
      <div className="grid grid-cols-2 gap-5">
        <div className="flex items-center gap-2.5">
          <input type="checkbox" id="streaks" checked={data.enableStreaks || false} onChange={(e) => setData({ ...data, enableStreaks: e.target.checked })} className="w-4 h-4 rounded border-edge accent-accent" />
          <label htmlFor="streaks" className="text-[13px] text-fg-2">Enable Streaks</label>
        </div>
        <div className="flex items-center gap-2.5">
          <input type="checkbox" id="levels" checked={data.enableLevels || false} onChange={(e) => setData({ ...data, enableLevels: e.target.checked })} className="w-4 h-4 rounded border-edge accent-accent" />
          <label htmlFor="levels" className="text-[13px] text-fg-2">Enable Levels</label>
        </div>
        <Field label="XP Per Session"><input type="number" value={data.xpPerSession || 0} onChange={(e) => setData({ ...data, xpPerSession: parseInt(e.target.value) })} className={inputCls} /></Field>
        <Field label="XP Per Review"><input type="number" value={data.xpPerReview || 0} onChange={(e) => setData({ ...data, xpPerReview: parseInt(e.target.value) })} className={inputCls} /></Field>
      </div>
    </SettingsSection>
  );
};

export default Settings;
