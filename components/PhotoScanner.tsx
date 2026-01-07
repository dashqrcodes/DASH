"use client";

type Props = {
  onScanComplete?: (file: File) => void | Promise<void>;
  onClose?: () => void;
  language?: "en" | "es" | string;
};

export default function PhotoScanner({ onScanComplete, onClose, language }: Props) {
  // Legacy placeholder for archived _dashmemories slideshow; no-op for current app.
  void onScanComplete;
  void onClose;
  void language;
  return null;
}

