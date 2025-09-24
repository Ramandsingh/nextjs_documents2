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
    } catch (e: any) {
      console.error('Error processing receipts:', e);
      setError(e.message || 'Failed to process receipts.');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Receipt Analyzer</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Upload Your Receipts</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Drag and drop your receipt images below, then click 'Process Receipts' to extract detailed information.
          </p>
        </section>

        <section className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-2xl">
            <FileUpload onFilesAccepted={handleFilesAccepted} />
          </div>
          <button
            onClick={handleProcessReceipts}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || acceptedFiles.length === 0}
          >
            {loading ? 'Processing...' : 'Process Receipts'}
          </button>
          {error && <p className="text-red-500 mt-4 text-center">Error: {error}</p>}
        </section>

        {processedData.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Processed Receipts</h2>
            <ReceiptTable data={processedData} />
          </section>
        )}

        {rawApiResponses.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Raw API Responses</h2>
            <div className="space-y-4">
              {rawApiResponses.map((response, index) => (
                <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                  {response}
                </pre>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}