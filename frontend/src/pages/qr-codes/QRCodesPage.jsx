import React, { useState, useEffect } from 'react';
import { QrCode, Download, Printer, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const QRCodesPage = () => {
  const { clinic } = useAuth();
  const { showToast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalPage, setActiveModalPage] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getBookingPages()
      .then((res) => setPages(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    showToast('Booking URL copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Codes Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate, download, and print physical tent cards for your dental clinic counter, waiting room, or marketing brochures.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : pages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-800">No booking pages configured</p>
          <p className="text-xs text-slate-500 mt-1">Please create a booking page first to generate QR codes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page._id} className="p-6 flex flex-col items-center text-center shadow-card">
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Scan to Book
              </span>
              <h3 className="text-base font-bold text-slate-900">{page.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{clinic?.name || 'CareSlot Clinic'}</p>

              {/* QR Image Box */}
              <div className="my-5 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:scale-[1.02] transition-transform">
                {page.qrDataUrl ? (
                  <img src={page.qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Generating...
                  </div>
                )}
              </div>

              {/* URL */}
              <div className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="font-mono text-[11px] truncate flex-1 text-left px-1">
                  {page.fullUrl}
                </span>
                <button
                  onClick={() => handleCopy(page.fullUrl)}
                  className="p-1 hover:text-brand-600 transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <Button
                  onClick={() => setActiveModalPage(page)}
                  variant="primary"
                  size="sm"
                  icon={Printer}
                >
                  Print Card
                </Button>
                <a
                  href={page.qrDataUrl}
                  download={`${page.slug}-qr.png`}
                  className="inline-flex items-center justify-center font-medium transition-all text-xs px-2.5 py-1.5 rounded-lg gap-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeModalPage && (
        <QRCodeModal
          isOpen={!!activeModalPage}
          onClose={() => setActiveModalPage(null)}
          title={activeModalPage.title}
          bookingUrl={activeModalPage.fullUrl}
          clinicName={clinic?.name || 'SmileCare Dental Clinic'}
        />
      )}
    </div>
  );
};
