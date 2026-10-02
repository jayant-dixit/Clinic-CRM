import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Smartphone,
  Mail,
  Send,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const NotificationsPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'logs'
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template editor state
  const [selectedEventType, setSelectedEventType] = useState('CONFIRMATION');
  const [selectedChannel, setSelectedChannel] = useState('WHATSAPP');
  const [templateText, setTemplateText] = useState(
    'Hello {{patientName}}, your appointment with {{doctorName}} for {{serviceName}} is confirmed for {{date}} at {{time}} at {{clinicName}}. Ref ID: {{appointmentId}}.'
  );
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Test send state
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [sendingTest, setSendingTest] = useState(false);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const [tRes, lRes] = await Promise.all([
        api.getNotificationTemplates(),
        api.getNotificationLogs(),
      ]);
      setTemplates(tRes.data || []);
      setLogs(lRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const handleSaveTemplate = async () => {
    try {
      setSavingTemplate(true);
      await api.updateNotificationTemplate({
        eventType: selectedEventType,
        channel: selectedChannel,
        template: templateText,
      });
      showToast('Notification template saved successfully', 'success');
      fetchNotificationData();
    } catch (err) {
      showToast(err.message || 'Failed to save template', 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      const res = await api.sendTestNotification({
        channel: selectedChannel,
        recipientPhone: testPhone,
      });
      showToast(res.message || 'Test notification dispatched', 'success');
      fetchNotificationData();
    } catch (err) {
      showToast(err.message || 'Failed to send test notification', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const eventTypes = [
    { key: 'CONFIRMATION', label: 'Appointment Confirmation' },
    { key: 'REMINDER', label: 'Appointment Reminder (Day Before)' },
    { key: 'RESCHEDULED', label: 'Rescheduled Notification' },
    { key: 'CANCELLED', label: 'Cancellation Notice' },
    { key: 'FOLLOW_UP', label: 'Follow-up Recommendation' },
    { key: 'THANK_YOU', label: 'Post-visit Thank You' },
  ];

  const variables = [
    { tag: '{{patientName}}', desc: "Patient's Full Name" },
    { tag: '{{doctorName}}', desc: "Treating Doctor's Name" },
    { tag: '{{serviceName}}', desc: 'Procedure / Treatment' },
    { tag: '{{date}}', desc: 'Appointment Date' },
    { tag: '{{time}}', desc: 'Appointment Time' },
    { tag: '{{clinicName}}', desc: 'Clinic Name' },
    { tag: '{{appointmentId}}', desc: 'Unique Appointment Ref ID' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification System</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated WhatsApp, SMS, and Email messaging with template variables and delivery logs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'templates' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            Templates & Triggers
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            Dispatch Audit Logs ({logs.length})
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Event Type & Channel Pickers (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Select Channel
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-600' },
                  { key: 'SMS', label: 'SMS', icon: Smartphone, color: 'text-blue-600' },
                  { key: 'EMAIL', label: 'Email', icon: Mail, color: 'text-purple-600' },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannel === ch.key;
                  return (
                    <button
                      key={ch.key}
                      onClick={() => setSelectedChannel(ch.key)}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${ch.color}`} />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Select Event Trigger
              </h3>
              <div className="space-y-1.5">
                {eventTypes.map((evt) => (
                  <button
                    key={evt.key}
                    onClick={() => setSelectedEventType(evt.key)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedEventType === evt.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {evt.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Test Card */}
            <Card className="p-4 bg-slate-50/80">
              <h3 className="text-xs font-bold text-slate-900 mb-1">Simulate / Send Test Message</h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Tests template variable resolution using mock/active provider.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Recipient phone number"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <Button
                  onClick={handleSendTest}
                  loading={sendingTest}
                  variant="outline"
                  size="sm"
                  icon={Send}
                  className="w-full"
                >
                  Dispatch Test {selectedChannel}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Template Editor & Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Template: {eventTypes.find((e) => e.key === selectedEventType)?.label}
                  </h3>
                  <span className="text-[11px] font-mono text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    Channel: {selectedChannel}
                  </span>
                </div>

                <Button
                  onClick={handleSaveTemplate}
                  loading={savingTemplate}
                  variant="primary"
                  size="sm"
                  icon={Save}
                >
                  Save Template
                </Button>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Content (Markdown formatting supported on WhatsApp)
                </label>
                <textarea
                  rows={6}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-brand-100 focus:border-brand-500 font-mono text-slate-800"
                />
              </div>

              {/* Supported Dynamic Variables */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Click to Insert Variables:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {variables.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => setTemplateText((prev) => `${prev} ${v.tag}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-[11px] font-mono font-medium text-slate-600 transition-colors"
                      title={v.desc}
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white">
                <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
                  Live Patient Notification Preview
                </span>
                <p className="text-xs mt-2 font-sans leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {templateText
                    .replace(/\{\{patientName\}\}/g, 'Rahul Sharma')
                    .replace(/\{\{doctorName\}\}/g, 'Dr. Rahul Sharma')
                    .replace(/\{\{serviceName\}\}/g, 'Dental Consultation')
                    .replace(/\{\{date\}\}/g, '10 October 2026')
                    .replace(/\{\{time\}\}/g, '11:30 AM')
                    .replace(/\{\{clinicName\}\}/g, 'SmileCare Dental Clinic')
                    .replace(/\{\{appointmentId\}\}/g, 'APT-20261010-0012')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* LOGS TAB */
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Dispatched Notifications</h3>
            <span className="text-xs text-slate-500">Live mock & active gateway records</span>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No notifications dispatched yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {log.channel === 'WHATSAPP' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                      {log.channel === 'SMS' && <Smartphone className="w-4 h-4 text-blue-600" />}
                      {log.channel === 'EMAIL' && <Mail className="w-4 h-4 text-purple-600" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.recipientName}</span>
                        <span className="text-slate-400 font-mono">({log.recipientPhone || log.recipientEmail})</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                          {log.eventType}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-1">{log.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
