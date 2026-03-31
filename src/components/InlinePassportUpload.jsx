import React, { useState, useRef } from 'react';
import { Scan, Camera, Upload, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

import { API_URL } from '../config';

async function scanPassportWithAI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'scan_passport',
            image: base64Data,
            mimeType,
            message: 'scan_passport',
            sessionId: 'passport_scan',
          }),
        });
        if (!response.ok) throw new Error('Scan failed');
        let data = await response.json();
        if (data && typeof data.body === 'string') {
          try { data = JSON.parse(data.body); } catch (_) {}
        } else if (data && typeof data.body === 'object' && data.body !== null) {
          data = data.body;
        }
        if (data && data.passport) resolve(data.passport);
        else reject(new Error(data?.error || 'Could not read passport data'));
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const InlinePassportUpload = ({ onPassportScanned, completed }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [localDone, setLocalDone] = useState(completed || false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = null;
    setScanError(null);
    setIsScanning(true);
    try {
      const passport = await scanPassportWithAI(file);
      setLocalDone(true);
      onPassportScanned(passport);
    } catch (err) {
      setScanError(
        err.message?.includes('Could not read') || err.message?.includes('Scan failed')
          ? "Couldn't extract data from this image. Ensure the passport data page is clear and well-lit, then try again."
          : `⚠️ ${err.message}`
      );
    } finally {
      setIsScanning(false);
    }
  };

  // ── Completed state: compact success badge ──
  if (localDone) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fade-in-zoom max-w-sm mt-2">
        {/* Pulsing check icon */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping" style={{ animationIterationCount: 1, animationDuration: '0.7s' }} />
        </div>
        <div>
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Passport scanned successfully!</div>
          <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">Details auto-filled ✓</div>
        </div>
      </div>
    );
  }

  // ── Scanning state ──
  if (isScanning) {
    return (
      <div className="max-w-sm mt-3">
        <div className="p-5 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/[0.06] text-center space-y-3 animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/25 flex items-center justify-center shadow-sm shadow-accent/15">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Reading Passport…</h3>
            <p className="text-[11px] text-gray-500 dark:text-white/40 mt-1 leading-relaxed px-2">
              Our AI is extracting your details — just a moment…
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Default: upload prompt ──
  return (
    <div className="max-w-sm mt-3">
      <div className="p-5 rounded-2xl border-2 border-dashed border-accent/20 bg-accent/[0.04] text-center transition-all hover:bg-accent/[0.07] hover:border-accent/50 space-y-3">
        <div className="w-12 h-12 mx-auto bg-accent/20 rounded-2xl flex items-center justify-center shadow-sm shadow-accent/10">
          <Scan className="w-5 h-5 text-accent" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Upload Your Passport</h3>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1 leading-relaxed px-2">
            Take a photo or upload your passport's data page. I'll auto-fill your info instantly.
          </p>
        </div>

        {scanError && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-left animate-fade-in-up">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed">{scanError}</span>
          </div>
        )}

        <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf" className="hidden" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setScanError(null); cameraInputRef.current?.click(); }}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-accent-foreground bg-accent hover:opacity-90 transition-all flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-accent/30 outline-none"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
          <button
            onClick={() => { setScanError(null); fileInputRef.current?.click(); }}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 shadow-sm focus:ring-2 focus:ring-gray-300/40 outline-none"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlinePassportUpload;
