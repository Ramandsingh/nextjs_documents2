'use client'; // Re-added 'use client' directive

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { processReceipts } from '@/app/actions';
import { ReceiptTable } from '@/components/receipt-table';
import { isAuthenticated, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation'; // Import useRouter

interface ReceiptData {
  store_name: string;
  country: string;
  receipt_type: string;
  address: string;
  datetime: string;
  currency: string;
  sub_total_amount: number | 'unknown';
  total_price: number;
  total_discount: number;
  all_items_price_with_tax: boolean | 'unknown';
  payment_method: 'card' | 'cash' | 'unknown';
  rounding: number;
  tax: number;
  taxes_not_included_sum: number;
  tips: number;
  items: Array<{
    name: string;
    quantity: number;
    measurement_unit: string;
    total_price_without_discount: number;
    unit_price: number;
    total_price_with_discount: number;
    discount: number;
    category: string;
    item_price_with_tax: boolean | 'True' | 'False';
  }>;
  taxs_items: Array<{
    tax_name: string;
    percentage: number;
    tax_from_amount: number;
    tax: number;
    total: number;
    tax_included: boolean | 'True' | 'False';
  }>;
}

export default function Home() { // Changed back to a regular function
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ReceiptData[]>([]);
  const [rawApiResponses, setRawApiResponses] = useState<string[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // New state to track if auth check is done
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
      setAuthChecked(true); // Mark auth check as done
      if (!authenticated) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleFilesAccepted = (files: File[]) => {
    setAcceptedFiles(files);
  };

  const handleProcessReceipts = async () => {
    if (acceptedFiles.length === 0) {
      alert('Please upload at least one receipt image.');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessedData([]);
    setRawApiResponses([]);

    try {
      const result: { processedData: ReceiptData[]; rawResponses: string[] } = await processReceipts(acceptedFiles);
      setProcessedData(result.processedData);
      setRawApiResponses(result.rawResponses);
      console.log('Processed Receipt Data:', result.processedData);
      console.log('Raw API Responses:', result.rawResponses);
    } catch (e: unknown) {
      console.error('Error processing receipts:', e);
      if (e instanceof Error) {
        setError(e.message || 'Failed to process receipts.');
      } else {
        setError('Failed to process receipts.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!authChecked) { // Show loading until authentication check is complete
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading authentication...</div>;
  }

  if (!isAuth) { // If not authenticated after check, don't render the app content
    return null; // Redirection is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <header className="w-full backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Receipt Analyzer
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Logout
        </button>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-12 max-w-6xl">
        {/* Compact Hero Section */}
        <section className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Transform Your Receipts
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Upload receipt images and watch AI extract detailed information instantly.
          </p>
        </section>

        {/* Compact Upload & Process Section */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

              {/* Upload Zone */}
              <div className="lg:col-span-2">
                <FileUpload onFilesAccepted={handleFilesAccepted} />
              </div>

              {/* Process Button & Status */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleProcessReceipts}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                  disabled={loading || acceptedFiles.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Process Receipts</span>
                    </div>
                  )}
                </button>

                {/* File Count Badge */}
                {acceptedFiles.length > 0 && (
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                    {acceptedFiles.length} file{acceptedFiles.length !== 1 ? 's' : ''} ready
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {processedData.length > 0 && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Processing Complete!</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {processedData.length === 1
                  ? "Your receipt has been analyzed and structured"
                  : `${processedData.length} receipts analyzed and structured`
                }
              </p>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <ReceiptTable data={processedData} />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}