import React, { createContext, useContext, useState } from 'react';
import { Send, LifeBuoy, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

const SupportModalContext = createContext(null);

export const SupportModalProvider = ({ children }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
  });

  const openSupportModal = (preset = {}) => {
    setFormData({
      subject: preset.subject || '',
      description: preset.description || '',
      category: preset.category || 'FEATURE_REQUEST',
      priority: preset.priority || 'HIGH',
    });
    setIsOpen(true);
  };

  const closeSupportModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createSupportTicketByClinic(formData);
      if (res.success) {
        showToast('Complaint/feedback submitted directly to SuperAdmin!', 'success');
        setIsOpen(false);
        setFormData({
          subject: '',
          description: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SupportModalContext.Provider value={{ openSupportModal, closeSupportModal }}>
      {children}

      {/* Global Support & Feedback Modal (Submits directly to SuperAdmin) */}
      <Modal
        isOpen={isOpen}
        onClose={closeSupportModal}
        title="Submit Request / Complaint to SuperAdmin"
        description="Your message will be sent directly to the root SaaS administrator for immediate review."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Feedback Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="FEATURE_REQUEST">Feature Request / Unlock</option>
                <option value="BILLING">Billing & Subscription</option>
                <option value="GENERAL">General Inquiries</option>
                <option value="BUG">Technical Issue / Bug</option>
                <option value="OTHER">Other Complaint</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject / Summary *</label>
            <input
              type="text"
              required
              placeholder="e.g. Request to unlock Dynamic Forms feature"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Request / Complaint Details *</label>
            <textarea
              required
              rows={4}
              placeholder="Explain the feature unlock request, question or feedback..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={closeSupportModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              iconRight={Send}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Submit to SuperAdmin
            </Button>
          </div>
        </form>
      </Modal>
    </SupportModalContext.Provider>
  );
};

export const useSupportModal = () => {
  const context = useContext(SupportModalContext);
  if (!context) {
    throw new Error('useSupportModal must be used within a SupportModalProvider');
  }
  return context;
};
