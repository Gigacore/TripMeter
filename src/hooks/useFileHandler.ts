import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { parseCSV, CSVRow } from '../services/csvParser';
import { normalizeHeaders } from '../utils/csv';

export const useFileHandler = () => {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => setError(msg);
  const clearError = () => setError('');

  const resetState = () => {
    setRows([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file?: File) => {
    resetState();
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Please select a .csv file.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseCSV(file);
      if (!result || !result.meta || !result.data) {
        throw new Error('Failed to parse CSV.');
      }

      const idxMap = normalizeHeaders(result.meta.fields || []);
      if (!idxMap) {
        showError('Missing required headers. Expected: begintrip_lat, begintrip_lng, dropoff_lat, dropoff_lng (case-insensitive).');
        setIsProcessing(false);
        return;
      }

      const normalizedRows = result.data.map(obj => {
        const out: CSVRow = {};
        for (const k in obj) {
          if (Object.hasOwn(obj, k)) {
            out[k.trim().toLowerCase()] = obj[k];
          }
        }
        return out;
      });

      setRows(normalizedRows);
      clearError();
    } catch (e) {
      console.error(e);
      showError('Unable to read this CSV. Please check formatting.');
      setRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  return {
    rows,
    setRows,
    error,
    isProcessing,
    isDragging,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragEvents,
    resetState,
  };
};