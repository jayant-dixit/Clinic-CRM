import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, Check, ExternalLink, Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const QRCodeModal = ({ isOpen, onClose, title, bookingUrl, clinicName }) => {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (bookingUrl) {
      QRCode.toDataURL(bookingUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).then(setDataUrl).catch(console.error);
    }
  }, [bookingUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    showToast('Booking link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR code downloaded successfully', 'success');
  };

  const handlePrintTentCard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${clinicName} - Scan to Book</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { border: 2px solid #0f172a; padding: 40px; border-radius: 24px; max-width: 400px; }
            h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }
            p { font-size: 14px; color: #64748b; margin-top: 0; }
            img { width: 240px; height: 240px; margin: 20px 0; }
            .badge { background: #2563eb; color: white; padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Scan with Camera</span>
            <h1>${clinicName}</h1>
            <p>${title}</p>
            <img src="${dataUrl}" alt="QR Code" />
            <p><strong>Instant Appointment Booking</strong></p>
            <p style="font-size: 11px; color: #94a3b8;">${bookingUrl}</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment QR Code"
      description={`Share or print this QR code for ${title}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        {/* Printable Tent-Card Styled Preview */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center w-full shadow-2xs">
          <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Scan to Book
          </span>
          <h4 className="text-base font-bold text-slate-900">{clinicName}</h4>
          <p className="text-xs text-slate-500">{title}</p>

          <div className="my-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
            {dataUrl ? (
              <img src={dataUrl} alt="Booking QR Code" className="w-52 h-52 rounded-lg" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium">Patients can scan with any phone camera</p>
        </div>

        {/* URL Box */}
        <div className="mt-4 w-full flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <input
            type="text"
            readOnly
            value={bookingUrl}
            className="flex-1 bg-transparent px-2 py-1 text-slate-700 font-mono text-[11px] focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 bg-white text-slate-700 hover:text-brand-600 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 w-full mt-4">
          <Button onClick={handleDownload} variant="secondary" icon={Download}>
            Download PNG
          </Button>
          <Button onClick={handlePrintTentCard} variant="primary" icon={Printer}>
            Print Counter Card
          </Button>
        </div>

        <div className="mt-3">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            <span>Open live booking page in new tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
