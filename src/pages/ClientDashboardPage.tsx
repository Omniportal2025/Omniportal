import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import { UserCircleIcon, ArrowRightOnRectangleIcon, CreditCardIcon, TicketIcon, XMarkIcon, DocumentArrowUpIcon, KeyIcon, ArrowUpTrayIcon, CheckIcon, XCircleIcon, ChevronDownIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ClockIcon, BanknotesIcon, CurrencyDollarIcon  } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

// Define types
interface Client {
  id: number;
  Name: string;
  Email: string;
  Phone: string;
  Address: string;
  'Date Joined': string;
}

interface Balance {
  id: number;
  Name: string;
  Block: string;
  Lot: string;
  TCP: number | null;
  Amount: number | null;
  'Months Paid': string | null;
  'MONTHS PAID': number | null;
  'Remaining Balance': number | null;
  Project: string;
  Terms: string;
}

// Ticket Submission Modal Props
interface TicketSubmissionModalProps {
  clientName: string;
  isOpen: boolean;
  closeModal: () => void;
  refreshTickets: () => void;
}

// Function to fetch client tickets
const fetchClientTickets = async (clientName: string, supabaseClient: any): Promise<any[]> => {
  if (!clientName) return [];
  
  try {
    console.log('Fetching tickets for client:', clientName);
    
    // Fetch tickets from Tickets table
    const { data, error } = await supabaseClient
      .from('Tickets')
      .select('*')
      .eq('Name', clientName)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
      return [];
    }
    
    console.log('Tickets found:', data);
    return data || [];
  } catch (err) {
    console.error('Error in tickets fetch:', err);
    toast.error('Failed to load tickets');
    return [];
  }
};

// Ticket Submission Modal Component
const TicketSubmissionModal: React.FC<TicketSubmissionModalProps> = ({ 
  clientName, 
  isOpen, 
  closeModal, 
  refreshTickets
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create new ticket in Supabase
      const { error: ticketError } = await supabase
        .from('Tickets')
        .insert([
          {
            Name: clientName,
            Subject: subject,
            Description: description,
            Priority: 'medium', // Default priority
            Status: 'new',
            Assigned: null // Not assigned initially
          }
        ])
        .select();

      if (ticketError) throw ticketError;

      setSuccess(true);
      refreshTickets();
      // Close modal after successful submission
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setSubject('');
        setDescription('');
      }, 3000);
    } catch (err: any) {
      console.error("Ticket submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all modal-scrollbar">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Submit Support Ticket
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Need help? Submit a ticket and our team will get back to you as soon as possible.
                  </p>
                </div>

                {success ? (
                  <div className="mt-6">
                    <div className="rounded-lg bg-green-50 p-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-green-800">Ticket submitted successfully!</p>
                      <p className="mt-2 text-sm text-green-700">Our team will review your request shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
                          Subject
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Brief description of your issue"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                          Description
                        </label>
                        <div className="mt-2">
                          <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Please provide details about your issue"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Ticket'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Payment Receipt Modal Props
interface PaymentReceiptModalProps {
  isOpen: boolean;
  closeModal: () => void;
  clientName: string;
  selectedBlock?: string | null;
  selectedLot?: string | null;
  balanceRecords: Balance[];
}

// Payment Receipt Modal Component
const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ 
  isOpen, 
  closeModal, 
  clientName,
  selectedBlock,
  selectedLot,
  balanceRecords
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBlockLot, setSelectedBlockLot] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [penalty, setPenalty] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [paymentMonth, setPaymentMonth] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<string>('15th');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to handle dates without timezone shifting
  const formatToLocalDate = (date: Date | null) => {
    if (!date) return null;
    // Create a new date with the same year, month, and day, but at noon to avoid timezone issues
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  };

  // Helper function to set date to first day of the month
  const formatToMonthStart = (date: Date | null) => {
    if (!date) return null;
    // Create a new date set to the first day of the selected month at noon
    return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
  };

  // Group balance records by project
  const projectBalances = useMemo(() => {
    const grouped = balanceRecords.reduce((acc, record) => {
      if (!acc[record.Project]) {
        acc[record.Project] = [];
      }
      acc[record.Project].push(record);
      return acc;
    }, {} as { [key: string]: Balance[] });
    return grouped;
  }, [balanceRecords]);

  // Set initial selected block and lot
  useEffect(() => {
    if (selectedBlock && selectedLot) {
      setSelectedBlockLot(`Block ${selectedBlock} Lot ${selectedLot}`);
      // Find and set the project for the selected block and lot
      const record = balanceRecords.find(r => r.Block === selectedBlock && r.Lot === selectedLot);
      if (record) {
        setSelectedProject(record.Project);
      }
    } else if (balanceRecords.length > 0) {
      // If client has only one project, auto-select it
      const projects = Object.keys(projectBalances);
      if (projects.length === 1) {
        const singleProject = projects[0];
        setSelectedProject(singleProject);
        
        // If there's only one block & lot for this project, auto-select it
        const blockLots = projectBalances[singleProject];
        if (blockLots.length === 1) {
          const record = blockLots[0];
          setSelectedBlockLot(`Block ${record.Block} Lot ${record.Lot}`);
        }
      }
    }
  }, [selectedBlock, selectedLot, balanceRecords, projectBalances]);

  // Auto-select block & lot when project changes and there's only one option
  useEffect(() => {
    if (selectedProject && projectBalances[selectedProject]) {
      const blockLots = projectBalances[selectedProject];
      if (blockLots.length === 1) {
        const record = blockLots[0];
        setSelectedBlockLot(`Block ${record.Block} Lot ${record.Lot}`);
      }
    }
  }, [selectedProject, projectBalances]);

  // Clear form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setSelectedBlockLot(null);
      setSelectedProject('');
      setAmount('');
      setPenalty('');
      setPaymentDate(null);
      setPaymentMonth(null);
      setError(null);
      setSuccess(false);
      setPreviewUrl(null);
      setPreviewError(null);
      setIsDragging(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const processFile = async (file: File) => {
    setPreviewError(null);
    setIsProcessing(true);

    // Validate file type (only PNG and JPG)
    if (!file.type.match(/^image\/(png|jpeg)$/)) {
      setPreviewError('Only PNG and JPG files are allowed');
      setIsProcessing(false);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setPreviewError('File size exceeds 10MB limit');
      setIsProcessing(false);
      return;
    }

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setPreviewError('Failed to generate preview');
        setIsProcessing(false);
        return;
      }
    } else {
      setPreviewUrl(null);
      setIsProcessing(false);
    }

    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    // Reset block & lot when project changes
    setSelectedBlockLot(null);
  };

  const handleBlockLotChange = (blockLot: string) => {
    setSelectedBlockLot(blockLot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file) {
        toast.error('Please select a receipt file to upload');
        throw new Error('Please select a receipt file to upload');
      }

      if (!selectedProject || !selectedBlockLot || !amount || !paymentDate || !paymentMonth || !referenceNumber) {
        toast.error('Please fill in all required fields');
        throw new Error('Please fill in all required fields');
      }

      // Create folder path for client's receipts
      const fileExt = file.name.split('.').pop();
      // Format the date as YYYY-MM-DD
      const paymentDateFormatted = paymentDate ? new Date(paymentDate).toISOString().split('T')[0] : '';
      // Create standardized filename: YYYY-MM-DD_BlockX-LotY.ext
      const blockLotFormatted = selectedBlockLot?.replace(/\s+/g, '').replace('Block', '').replace('Lot', '-') || '';
      const fileName = `${paymentDateFormatted}_${blockLotFormatted}.${fileExt}`;
      // Create path with client folder
      const filePath = `${clientName}/${fileName}`;
      
      toast.loading('Uploading receipt...');
      const { error: uploadError } = await supabase.storage
        .from('Payment Receipt')
        .upload(filePath, file, { upsert: true }); // Use upsert to replace if exists

      if (uploadError) {
        toast.error('Failed to upload receipt');
        throw uploadError;
      }

      toast.loading('Saving payment details...');
      // Save payment data to Payment table with the path including client folder
      const { error: dbError } = await supabase
        .from('Payment')
        .insert([
          {
            "receipt_path": filePath, // Store the full path including client folder
            "Block & Lot": selectedBlockLot,
            "Payment Amount": parseFloat(amount),
            "Penalty Amount": penalty ? parseFloat(penalty) : null,
            "Date of Payment": formatToLocalDate(paymentDate)?.toISOString(),
            "Month of Payment": formatToMonthStart(paymentMonth)?.toISOString(),
            "Due Date": dueDate, // Add the due date field
            "Name": clientName,
            "Project": selectedProject, // Add the selected project
            "Status": "Pending", // Changed to capital P to match standard status format
            "Reference Number": referenceNumber,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) {
        toast.error('Failed to save payment details');
        throw new Error(`Error saving payment information: ${dbError.message}`);
      }

      toast.success('Payment submitted successfully!');
      setSuccess(true);
      
      // Close modal after successful submission
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setFile(null);
        setSelectedBlockLot(null);
        setSelectedProject('');
        setAmount('');
        setPenalty('');
        setReferenceNumber('');
        setPaymentDate(null);
        setPaymentMonth(null);
        setPreviewUrl(null);
      }, 3000);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                {success ? (
                  <div className="p-6 sm:p-8">
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
                        <CheckIcon className="h-8 w-8 text-green-600 animate-bounce" />
                      </div>
                      <p className="text-lg font-semibold text-green-800">Payment receipt uploaded successfully!</p>
                      <p className="text-sm text-green-700">Your payment is being processed. You'll receive a confirmation soon.</p>
                      <button
                        onClick={closeModal}
                        className="mt-4 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-6 sm:px-8 sm:py-8">
                      <Dialog.Title className="text-xl font-semibold text-white">Upload Payment Receipt</Dialog.Title>
                      <p className="mt-2 text-sm text-blue-100">Please provide your payment details and upload the receipt</p>
                    </div>

                    <div className="px-6 py-6 sm:px-8 sm:py-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
  {/* Receipt Upload Field */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Receipt (PNG or JPG only)</label>
    <input
      type="file"
      accept="image/png, image/jpeg"
      onChange={e => {
        const file = e.target.files && e.target.files[0];
        if (file) processFile(file);
      }}
      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-blue-500"
      required
    />
    <p className="mt-1 text-xs text-gray-500">Only .png or .jpg files are allowed. Max size: 10MB.</p>
    {previewError && <div className="text-red-600 text-xs mt-1">{previewError}</div>}
    {previewUrl && (
      <div className="mt-2">
        <img src={previewUrl} alt="Receipt Preview" className="max-h-40 rounded border" />
      </div>
    )}
  </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                            {/* Project Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                              <div className="relative">
                                <select
                                  value={selectedProject || ''}
                                  onChange={(e) => handleProjectChange(e.target.value)}
                                  className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                  required
                                >
                                  <option value="" disabled>Select Project</option>
                                  {Object.keys(projectBalances).map((project, index) => (
                                    <option key={index} value={project}>{project}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                  <ChevronDownIcon className="h-5 w-5" />
                                </div>
                              </div>
                            </div>

                            {/* Block and Lot Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Block and Lot</label>
                              <div className="relative">
                                <select
                                  value={selectedBlockLot || ''}
                                  onChange={(e) => handleBlockLotChange(e.target.value)}
                                  className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                  required
                                >
                                  <option value="" disabled>Select Block and Lot</option>
                                  {projectBalances[selectedProject] && projectBalances[selectedProject].map((record: Balance, index: number) => (
                                    <option key={index} value={`Block ${record.Block} Lot ${record.Lot}`}>
                                      Block {record.Block} Lot {record.Lot}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                  <ChevronDownIcon className="h-5 w-5" />
                                </div>
                              </div>
                            </div>

                            {/* Reference Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={referenceNumber}
                                  onChange={(e) => setReferenceNumber(e.target.value)}
                                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                  placeholder="Enter reference number"
                                  required
                                />
                              </div>
                            </div>

                            {/* Amount Fields */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-gray-500 sm:text-sm">₱</span>
                                  </div>
                                  <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                    placeholder="0.00"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Penalty (if applicable)</label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-gray-500 sm:text-sm">₱</span>
                                  </div>
                                  <input
                                    type="number"
                                    id="penalty"
                                    value={penalty}
                                    onChange={(e) => setPenalty(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Date Fields */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                <div className="relative">
                                  <select
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                    required
                                  >
                                    <option value="15th">15th</option>
                                    <option value="30th">30th</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDownIcon className="h-5 w-5" />
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Payment</label>
                                <div className="relative">
                                  <DatePicker
                                    selected={paymentDate}
                                    onChange={(date: Date | null) => date && setPaymentDate(formatToLocalDate(date))}
                                    dateFormat="MMMM d, yyyy"
                                    placeholderText="Select date"
                                    className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                    calendarClassName="shadow-xl rounded-xl border-0 overflow-hidden"
                                    showPopperArrow={false}
                                    renderCustomHeader={({
                                      date,
                                      decreaseMonth,
                                      increaseMonth,
                                      prevMonthButtonDisabled,
                                      nextMonthButtonDisabled,
                                    }) => (
                                      <div className="flex flex-col space-y-2 p-4 bg-white border-b">
                                        <div className="flex items-center justify-between">
                                          <button
                                            onClick={decreaseMonth}
                                            disabled={prevMonthButtonDisabled}
                                            type="button"
                                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                                              prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                          </button>
                                          <h2 className="text-2xl font-semibold text-gray-900">
                                            {date.toLocaleString('default', { month: 'long' })}
                                          </h2>
                                          <button
                                            onClick={increaseMonth}
                                            disabled={nextMonthButtonDisabled}
                                            type="button"
                                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                                              nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                          </button>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-gray-500 font-medium">
                                            {date.getFullYear()}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    dayClassName={(date: Date | null) =>
                                      `hover:bg-gray-50 w-10 h-10 mx-auto flex items-center justify-center text-sm rounded-lg transition-colors text-gray-700
                                      ${date && date.toDateString() === (paymentDate ? paymentDate.toDateString() : '') 
                                        ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                                        : 'text-gray-700'}`
                                    }
                                    required
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <CalendarIcon className="h-5 w-5" />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Month of Payment</label>
                                <div className="relative">
                                  <DatePicker
                                    selected={paymentMonth}
                                    onChange={(date: Date | null) => date && setPaymentMonth(formatToMonthStart(date))}
                                    dateFormat="MMMM yyyy"
                                    showMonthYearPicker
                                    placeholderText="Select month"
                                    className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                    calendarClassName="shadow-xl rounded-xl border-0 overflow-hidden"
                                    showPopperArrow={false}
                                    renderCustomHeader={({
                                      date,
                                      decreaseYear,
                                      increaseYear,
                                      prevYearButtonDisabled,
                                      nextYearButtonDisabled,
                                    }) => (
                                      <div className="flex flex-col space-y-2 p-4 bg-white border-b">
                                        <div className="flex items-center justify-between">
                                          <button
                                            onClick={decreaseYear}
                                            disabled={prevYearButtonDisabled}
                                            type="button"
                                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                                              prevYearButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                          </button>
                                          <h2 className="text-2xl font-semibold text-gray-900">
                                            {date.getFullYear()}
                                          </h2>
                                          <button
                                            onClick={increaseYear}
                                            disabled={nextYearButtonDisabled}
                                            type="button"
                                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                                              nextYearButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    monthClassName={(date: Date | null) => {
                                      if (!date) return 'text-gray-700';
                                      const isSelected = paymentMonth && date.toISOString().slice(0, 7) === paymentMonth.toISOString().slice(0, 7);
                                      return `hover:bg-gray-50 py-3 rounded-lg transition-colors text-sm
                                        ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100' : 'text-gray-700'}`;
                                    }}
                                    required
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <CalendarIcon className="h-5 w-5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - File Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Receipt</label>
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-8 ${
                                isDragging
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 hover:border-blue-400'
                              } transition-all duration-300`}
                              style={{ minHeight: '280px' }}
                            >
                              {isProcessing ? (
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4 ring-8 ring-gray-50 animate-pulse">
                                    <DocumentArrowUpIcon className="h-8 w-8" />
                                  </div>
                                  <p className="text-sm text-gray-500">Processing file...</p>
                                </div>
                              ) : file ? (
                                <div className="text-center">
                                  {previewUrl && file.type.startsWith('image/') ? (
                                    <div className="mb-4">
                                      <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="mx-auto h-32 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 ring-8 ring-blue-50">
                                      <DocumentArrowUpIcon className="h-8 w-8" />
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFile(null);
                                        setPreviewUrl(null);
                                        setPreviewError(null);
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                      <XMarkIcon className="h-4 w-4 mr-1.5" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4 ring-8 ring-gray-50">
                                    <ArrowUpTrayIcon className="h-8 w-8" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {isDragging ? 'Drop your file here' : 'Drop your file here, or'}
                                    </p>
                                    <label className="relative cursor-pointer">
                                      <span className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                                        <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" />
                                        Browse Files
                                        <input
                                          type="file"
                                          className="sr-only"
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              processFile(e.target.files[0]);
                                            }
                                          }}
                                          accept="image/png,image/jpeg,image/jpg"
                                        />
                                      </span>
                                    </label>
                                    <p className="text-xs text-gray-500">PNG or JPG up to 10MB</p>
                                  </div>
                                </div>
                              )}
                              {previewError && (
                                <div className="absolute inset-x-0 -bottom-6">
                                  <p className="text-xs text-red-600">{previewError}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 sm:px-8 flex items-center justify-end space-x-3 border-t border-gray-100 -mx-6 sm:-mx-8 mt-6">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 ${
                              loading 
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <ArrowUpTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                                Upload Receipt
                              </>
                            )}
                          </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <div className="bg-red-50 rounded-lg p-4 mt-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-red-400" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Upload failed</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Change Password Modal Props
interface ChangePasswordModalProps {
  isOpen: boolean;
  closeModal: () => void;
  userId: string;
  onSuccess: () => void;
}

// Change Password Modal Component
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  closeModal, 
  userId,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Update password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Update the first_login flag in the Clients table
      const updateData: Record<string, boolean> = {
        'first_login': false
      };
      
      console.log('Updating client with data:', updateData);
      
      const { error: clientUpdateError } = await supabase
        .from('Clients')
        .update(updateData)
        .eq('auth_id', userId);

      if (clientUpdateError) {
        console.error('Error updating client first login status:', clientUpdateError);
        throw clientUpdateError;
      }

      setSuccess(true);
      
      // Close modal after successful password change
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Password change error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all modal-scrollbar">
                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                  Change Your Password
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    For security reasons, please change your temporary password to a new password that only you know.
                  </p>
                </div>

                {success ? (
                  <div className="mt-6">
                    <div className="rounded-lg bg-green-50 p-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-green-800">Password changed successfully!</p>
                      <p className="mt-2 text-sm text-green-700">You can now use your new password for future logins.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">
                          New Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Enter your new password"
                            required
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Password must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                          Confirm Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Confirm your new password"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        Change Later
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// View Payment Modal Props
interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: any[];
  isLoading: boolean;
  clientName: string;
}

// View Payment Modal Component
const ViewPaymentModal: React.FC<ViewPaymentModalProps> = ({ isOpen, onClose, payments, isLoading, clientName }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const handleViewReceipt = async (payment: any, isAR: boolean = false) => {
    if (!payment || !clientName) {
      toast.error('Payment information not found');
      return;
    }

    setIsLoadingReceipt(true);
    setIsReceiptModalOpen(true);
    setReceiptUrl(null);

    try {
      // Get receipt using the path that includes client folder
      const receiptPath = isAR ? payment.ar_receipt_path : payment.receipt_path;
      if (!receiptPath) {
        toast.error('Receipt not found');
        return;
      }
      
      console.log('Fetching receipt:', receiptPath);
      
      const { data, error } = await supabase.storage
        .from(isAR ? 'ar-receipt' : 'Payment Receipt')
        .download(receiptPath);

      if (error) {
        console.error('Error fetching receipt:', error);
        toast.error('Failed to load receipt');
        return;
      }

      if (!data) {
        console.error('Receipt not found');
        toast.error('Receipt not found');
        return;
      }

      // Create a URL for the downloaded file
      const url = URL.createObjectURL(data);
      console.log('Created object URL for receipt:', url);
      setReceiptUrl(url);
      
      // Clean up the URL when the modal is closed
      const cleanup = () => {
        URL.revokeObjectURL(url);
        setReceiptUrl(null);
      };

      return cleanup;
    } catch (err) {
      console.error('Error viewing receipt:', err);
      toast.error('Failed to view receipt. Please try again later.');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center">
                    Payment History
                  </Dialog.Title>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block & Lot</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month of Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AR Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment["Date of Payment"]).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment["Block & Lot"]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₱{payment["Payment Amount"].toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₱{payment["Penalty Amount"]?.toLocaleString() || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment["Month of Payment"]).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${payment.Status === "Approved" ? "bg-green-100 text-green-800" : 
                                    payment.Status === "Rejected" ? "bg-red-100 text-red-800" : 
                                    payment.Status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                    payment.Status === "closed" ? "bg-gray-100 text-gray-800" : 
                                    "bg-gray-100 text-gray-800"}`}
                                >
                                  {payment.Status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {payment.receipt_path && (
                                  <button 
                                    onClick={() => handleViewReceipt(payment)}
                                    className="text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View Receipt
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {payment.ar_receipt_path && (
                                  <button 
                                    onClick={() => handleViewReceipt(payment, true)}
                                    className="text-green-600 hover:text-green-800 focus:outline-none flex items-center"
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View AR
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No payment records found.</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all duration-200"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ViewReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          if (receiptUrl) {
            URL.revokeObjectURL(receiptUrl);
            setReceiptUrl(null);
          }
        }}
        receiptUrl={receiptUrl}
        isLoading={isLoadingReceipt}
      />
    </>
  );
};

// View Receipt Modal Props
interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  isLoading: boolean;
}

// View Receipt Modal Component
const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ isOpen, onClose, receiptUrl, isLoading }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center">
                  Payment Receipt
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : receiptUrl ? (
                  <div className="relative" style={{ height: '70vh' }}>
                    <iframe
                      src={receiptUrl}
                      className="w-full h-full rounded-lg border border-gray-200"
                      title="Payment Receipt"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2v-3a2 2 0 114 0v-3a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No Receipt Found</p>
                    <p className="text-sm text-gray-400">The receipt could not be loaded.</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [balanceRecords, setBalanceRecords] = useState<Balance[]>([]);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [selectedBalanceData, setSelectedBalanceData] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // New state for ticket modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  // New state for payment receipt modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // State for client document information
  const [clientDocument, setClientDocument] = useState<any>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  // State for change password modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  // State for client tickets
  const [clientTickets, setClientTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  // State for payment history
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Helper function to check if a value is empty (null, undefined, empty string, or zero)
  const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'number' && value === 0) return true;
    return false;
  };

  // Helper function to safely parse a numeric value from various formats
  const safelyParseNumber = (value: any): number | null => {
    if (isEmpty(value)) return null;
    
    try {
      // If it's already a number, return it
      if (typeof value === 'number') return value;
      
      // If it's a string, try to parse it
      if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point and minus sign
        const cleanedValue = value.replace(/[^\d.-]/g, '');
        const parsedValue = parseFloat(cleanedValue);
        return isNaN(parsedValue) ? null : parsedValue;
      }
      
      // For other types, try to convert to number
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    } catch (e) {
      console.error('Error parsing number:', e);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log('No session found, redirecting to login...');
          navigate('/login');
          return;
        }
        
        console.log('Session found, user ID:', data.session.user.id);
        setUserId(data.session.user.id);
        
        // Get client info using auth_id
        const { data: clientData, error: clientError } = await supabase
          .from('Clients')
          .select('*')
          .eq('auth_id', data.session.user.id)
          .single();
        
        if (clientError) {
          console.error('Client not found error:', clientError);
          setError(clientError.message);
          setLoading(false);
          return;
        }
        
        if (!clientData) {
          console.error('No client data found');
          setError('Client information not found');
          setLoading(false);
          return;
        }
        
        console.log('Client data retrieved:', clientData);
        setClient(clientData);
        
        try {
          // Get all records from the Balance table
          const { data: allBalanceRecords, error: balanceError } = await supabase
            .from('Balance')
            .select('*');
            
          if (balanceError) {
            console.error('Error fetching balance data:', balanceError);
            setError(balanceError.message);
            setLoading(false);
            return;
          }
          
          if (!allBalanceRecords || allBalanceRecords.length === 0) {
            console.log('No balance records found');
            setBalanceRecords([]);
            setLoading(false);
            return;
          }
          
          console.log('All balance records:', allBalanceRecords);
          
          // Find all records that match the client's name
          const matchedRecords = allBalanceRecords.filter(record => 
            record.Name && record.Name.toLowerCase() === clientData.Name.toLowerCase()
          );
          
          console.log('Matched balance records:', matchedRecords);
          
          if (matchedRecords.length > 0) {
            const processedRecords = matchedRecords.map(record => ({
              ...record,
              Block: String(record.Block),
              Lot: String(record.Lot),
              TCP: safelyParseNumber(record.TCP),
              Amount: safelyParseNumber(record.Amount),
              'Remaining Balance': safelyParseNumber(record['Remaining Balance'])
            }));
            
            console.log('Processed records:', processedRecords);
            setBalanceRecords(processedRecords);
            
            // Set the first record as the default selected
            const firstRecord = processedRecords[0];
            setSelectedLot(`Block ${firstRecord.Block} Lot ${firstRecord.Lot}`);
            setSelectedBalanceData(firstRecord);
          }
          
        } catch (err: any) {
          console.error('Error in balance data fetch:', err);
          setError(err.message);
        }
        
      } catch (err: any) {
        console.error('Error in auth check:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  const handleSignOut = handleLogout;
  
  // Function to fetch client document information
  const fetchClientDocument = async () => {
    if (!client) return;
    
    setIsLoadingDocument(true);
    try {
      console.log("Fetching document for client:", client.Name);
      
      // Fetch document information from Documents table
      const { data, error } = await supabase
        .from('Documents')
        .select('*')
        .eq('Name', client.Name);
      
      console.log("Document query result:", { data, error });
      
      if (error) {
        console.error('Error fetching document:', error);
        setClientDocument(null);
      } else if (data && data.length > 0) {
        console.log('Document data found:', data[0]);
        setClientDocument(data[0]);
      } else {
        console.log('No document found for client:', client.Name);
        setClientDocument(null);
      }
    } catch (err) {
      console.error('Error in document fetch:', err);
      setClientDocument(null);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Function to get and download document for a client
  const handleDownloadDocument = async () => {
    if (!client?.Name) return;
    
    try {
      setIsLoadingDocument(true);
      console.log('Document object:', clientDocument);
      
      // Get the client name from the document
      const clientName = client.Name;
      const clientNameWithUnderscore = clientName.replace(/\s+/g, '_');
      
      // First try to find files in root
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('Clients Document')
        .list();
        
      if (rootError) {
        console.error('Error listing root files:', rootError);
        throw rootError;
      }
      
      console.log('Files in root:', rootFiles);
      
      // Find files that match the client's name pattern in root
      const matchingRootFiles = rootFiles.filter(file => 
        file.name.toLowerCase().startsWith(clientNameWithUnderscore.toLowerCase())
      );
      
      console.log('Matching root files:', matchingRootFiles);
      
      if (matchingRootFiles && matchingRootFiles.length > 0) {
        // Found files in root, download the most recent one
        const mostRecentFile = matchingRootFiles[0];
        
        // Download the file
        const { data, error: downloadError } = await supabase.storage
          .from('Clients Document')
          .download(mostRecentFile.name);

        if (downloadError) {
          console.error('Error downloading file:', downloadError);
          throw downloadError;
        }

        if (!data) {
          throw new Error('No data received from storage');
        }
        
        console.log('File downloaded successfully, creating blob URL');
        
        // Create a download link for the file
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = mostRecentFile.name; // Keep original name for root files
        document.body.appendChild(a);
        
        console.log('Triggering download');
        a.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          console.log('Cleanup completed');
        }, 100);
        
        toast.success('Document downloaded successfully!');
        return;
      }
      
      // If no files found in root, try the client's folder
      console.log('No files in root, checking folder:', clientName);
      
      const { data: files, error: listError } = await supabase.storage
        .from('Clients Document')
        .list(clientName);
      
      if (listError) {
        console.error('Error listing files in folder:', listError);
        throw listError;
      }
      
      if (!files || files.length === 0) {
        throw new Error(`No files found for client ${clientName}`);
      }
      
      console.log('Files found in folder:', files);
      
      // Get the most recent file from folder
      const mostRecentFile = files.sort((a, b) => {
        const timestampA = parseInt(a.name.split('_')[0]) || 0;
        const timestampB = parseInt(b.name.split('_')[0]) || 0;
        return timestampB - timestampA;
      })[0];
      
      // Download the file from folder
      const { data, error: downloadError } = await supabase.storage
        .from('Clients Document')
        .download(`${clientName}/${mostRecentFile.name}`);
      
      if (downloadError) {
        console.error('Error downloading file:', downloadError);
        throw downloadError;
      }
      
      // Create a download link for the file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = mostRecentFile.name.split('_').slice(1).join('_');
      document.body.appendChild(a);
      
      console.log('Triggering download');
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Cleanup completed');
      }, 100);
      
      toast.success('Document downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Error downloading document: ' + (error.message || 'Please try again.'));
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Call fetchClientDocument when client data is available
  useEffect(() => {
    if (client) {
      fetchClientDocument();
    }
  }, [client]);
  
  // Handle lot selection change
  const handleLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedLot(selectedValue);
    
    console.log('Selected value:', selectedValue);
    console.log('All balance records:', balanceRecords);
    
    // Find the balance record that matches the selected lot
    const selectedOption = selectedValue.match(/Block (\d+) Lot (\d+)/);
    
    if (selectedOption) {
      const [_, block, lot] = selectedOption;
      console.log(`Looking for Block: ${block}, Lot: ${lot}`);
      
      // Find the exact matching record by comparing as strings to ensure exact matches
      const matchedRecord = balanceRecords.find(record => 
        String(record.Block) === String(block) && String(record.Lot) === String(lot)
      );
      
      console.log('Matched record:', matchedRecord);
      
      if (matchedRecord) {
        // Log the data types to debug NaN issues
        console.log('TCP type:', typeof matchedRecord.TCP, 'Value:', matchedRecord.TCP);
        console.log('Amount type:', typeof matchedRecord.Amount, 'Value:', matchedRecord.Amount);
        console.log('Remaining Balance type:', typeof matchedRecord['Remaining Balance'], 'Value:', matchedRecord['Remaining Balance']);
        
        // Create a processed copy with properly handled numeric values
        const processedRecord = {
          ...matchedRecord,
          // Keep the original values but ensure they're properly processed when displayed
        };
        
        console.log('Setting selected balance data to:', processedRecord);
        setSelectedBalanceData(processedRecord);
      }
    }
  };
  
  // Function to fetch client tickets
  const fetchClientTicketsForComponent = async () => {
    if (!client?.Name) return;
    
    setIsLoadingTickets(true);
    try {
      const tickets = await fetchClientTickets(client.Name, supabase);
      setClientTickets(tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setClientTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Call fetchClientTickets when client data is available
  useEffect(() => {
    if (client) {
      fetchClientDocument();
      fetchClientTicketsForComponent();
    }
  }, [client]);
  
  // Fetch payments
  const fetchPayments = async () => {
    if (!client?.Name) return;
    
    setIsLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('Payment')
        .select('*')
        .eq('Name', client.Name)
        .order('created_at', { ascending: false });

      console.log('Fetched payments:', data);
      if (error) throw error;
      
      // Normalize payment status to be consistent
      const normalizedData = data?.map(payment => ({
        ...payment,
        Status: payment.Status?.charAt(0).toUpperCase() + payment.Status?.slice(1).toLowerCase()
      })) || [];

      console.log('Normalized payments:', normalizedData);
      setPayments(normalizedData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // Call fetchPayments when client data is available
  useEffect(() => {
    if (client?.Name) {
      fetchPayments();
    }
  }, [client?.Name]);
  
  // Loading state UI
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading your dashboard</h2>
            <p className="text-gray-500 text-center">Please wait while we retrieve your information...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  // Error state UI  
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center ring-2 ring-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-5 text-center">{error}</p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 014 3.7M4.031 9.865a8.25 8.25 0 014 3.7l3.181-3.182m0-4.991v4.99" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Modern header with gradient */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-blue-600 mr-3">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{client?.Name}</h1>
                <p className="text-sm text-blue-100">{client?.Email}</p>
              </div>
            </div>
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-full text-white hover:text-gray-200 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-6 h-6"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
                  />
                </svg>
              </button>
              
              <button
                onClick={handleSignOut}
                className="ml-2 p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="pb-8">
            {/* Hero section with modern design */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              {/* Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,transparent_45%,#1e40af_100%)]" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22%23ffffff20%22%2F%3E%3C%2Fsvg%3E')] opacity-20" />
              </div>

              {/* Content */}
              <div className="relative px-6 py-8 md:px-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Welcome Section */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                          <span className="text-2xl font-bold text-white">{client?.Name?.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Welcome, {client?.Name}</h1>
                        <p className="text-blue-100 text-sm">Here's your current payment information</p>
                      </div>
                    </div>
                  </div>

                  {/* Property Selector */}
                  {balanceRecords.length > 1 && (
                    <div className="w-full md:w-auto">
                      <label htmlFor="lot-selector" className="block mb-2 text-sm font-medium text-blue-100">
                        Select Property
                      </label>
                      <div className="relative">
                        <select
                          id="lot-selector"
                          value={selectedLot || ''}
                          onChange={handleLotChange}
                          className="w-full md:w-72 px-4 py-3 bg-white/10 backdrop-blur text-white text-sm font-medium rounded-lg border border-white/20 shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
                            appearance-none transition-all duration-200 hover:bg-white/15"
                        >
                          {balanceRecords.map((record) => (
                            <option key={record.id} value={`Block ${record.Block} Lot ${record.Lot}`} 
                              className="bg-blue-800 text-white">
                              {record.Project} - Block {record.Block} Lot {record.Lot}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/70">
                          <ChevronDownIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {/* Monthly Amount Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:bg-white/15 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-100 mb-1">Total Amount Paid</p>
                        <p className="text-xl font-bold text-white truncate">₱{selectedBalanceData?.Amount?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Balance Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:bg-white/15 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <BanknotesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-100 mb-1">Remaining Balance</p>
                        <p className="text-xl font-bold text-white truncate">₱{selectedBalanceData?.["Remaining Balance"]?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Months Paid Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:bg-white/15 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-100 mb-1">MONTHS PAID</p>
                        <p className="text-xl font-bold text-white truncate">{selectedBalanceData?.["MONTHS PAID"] || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:bg-white/15 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-100 mb-1">Terms</p>
                        <p className="text-xl font-bold text-white truncate">{selectedBalanceData?.Terms || '0'} months</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Property Details */}
                {selectedBalanceData && (
                  <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Property Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-blue-100">Project</p>
                        <p className="text-base font-medium text-white mt-1">{selectedBalanceData.Project}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Block</p>
                        <p className="text-base font-medium text-white mt-1">{selectedBalanceData.Block}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Lot</p>
                        <p className="text-base font-medium text-white mt-1">{selectedBalanceData.Lot}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Total Amount Paid</p>
                        <p className="text-base font-medium text-white mt-1">₱{selectedBalanceData?.Amount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Remaining Balance</p>
                        <p className="text-base font-medium text-white mt-1">₱{selectedBalanceData?.["Remaining Balance"]?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Total Contract Price</p>
                        <p className="text-base font-medium text-white mt-1">₱{selectedBalanceData?.TCP?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Months Paid</p>
                        <p className="text-base font-medium text-white mt-1">{selectedBalanceData?.["Months Paid"] || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Terms</p>
                        <p className="text-base font-medium text-white mt-1">{selectedBalanceData?.Terms || '0'} months</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Account information - mobile-first design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Account Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <dt className="text-xs font-medium text-gray-500 mb-1 md:text-sm">Full name</dt>
                    <dd className="text-base font-semibold text-gray-900 md:text-lg">{client?.Name || 'N/A'}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <dt className="text-xs font-medium text-gray-500 mb-1 md:text-sm">Email address</dt>
                    <dd className="text-base font-semibold text-gray-900 break-all md:text-lg">{client?.Email || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Client Document Information Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Document Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                {isLoadingDocument ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : clientDocument ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(clientDocument)
                        .filter(([key, value]) => 
                          key !== 'Name' && 
                          key !== 'id' && 
                          key !== 'created_at' &&
                          value !== null && 
                          value !== ''
                        )
                        .map(([key, value], index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <h3 className="text-sm font-medium text-gray-500">
                              {key === 'TIN ID' ? 'TIN ID' : 
                               key === 'Contact No' ? 'Contact Number' : 
                               key === 'Marital Status' ? 'Marital Status' : 
                               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <p className="mt-1 text-base text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleDownloadDocument}
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-sm bg-gray-400 text-white cursor-not-allowed opacity-50`}
                        disabled={true}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2v-3a2 2 0 114 0v-3a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No document information found</p>
                    <p className="text-sm text-gray-400">Your document information will appear here once uploaded by an administrator.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Actions Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900">Payment Actions</h2>
                </div>
                <button
                  onClick={() => setIsViewPaymentModalOpen(true)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  View History
                </button>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-gray-600 mb-4">Upload your payment receipt for verification and processing.</p>
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                    Upload Receipt
                  </button>
                </div>
              </div>
            </div>
            
            {/* Support Tickets Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <TicketIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Support Tickets
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-gray-600 mb-4">Need assistance? Submit a support ticket and our team will help you as soon as possible.</p>
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Ticket
                  </button>
                </div>
                
                {/* Client Tickets List */}
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Your Support Tickets</h3>
                  
                  {isLoadingTickets ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : clientTickets.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {clientTickets.map((ticket, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{ticket.Subject}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.Description}</p>
                              {ticket.Response && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                                  <p className="text-sm text-blue-700">
                                    <span className="font-medium">Response:</span> {ticket.Response}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${ticket.Status === "new" ? "bg-blue-100 text-blue-800" : 
                                  ticket.Status === "in_progress" ? "bg-yellow-100 text-yellow-800" : 
                                  ticket.Status === "resolved" ? "bg-green-100 text-green-800" : 
                                  ticket.Status === "closed" ? "bg-gray-100 text-gray-800" : 
                                  "bg-gray-100 text-gray-800"}`}
                              >
                                {ticket.Status === "new" ? 'New' : 
                                 ticket.Status === "in_progress" ? 'In Progress' : 
                                 ticket.Status === "resolved" ? 'Resolved' : 
                                 ticket.Status === "closed" ? 'Closed' : 
                                 ticket.Status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2v-3a2 2 0 114 0v-3a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <p className="text-gray-500 mb-2">No support tickets found</p>
                      <p className="text-sm text-gray-400">Your submitted tickets will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - simplified */}
          <div className="border-t border-gray-200 pt-4 pb-6 mt-auto text-center">
            <p className="text-xs text-gray-500 md:text-sm">&copy; 2025 Omni Portal</p>
          </div>
        </main>
        
        {/* Mobile navigation - simplified for cleaner design */}
        {menuOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 md:hidden">
            <div className="h-full w-64 bg-white p-4 shadow-lg flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Menu</h3>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
                    />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <a href="#" className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors">
                  <UserCircleIcon className="h-5 w-5 mr-3 text-blue-600" />
                  Profile
                </a>
                <a href="#" className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 0118 0 9 9 0 012-18 9 9 0 01-18 0z" />
                  </svg>
                  Help & Support
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center p-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors mt-8"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Sign out
                </button>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="flex w-full items-center p-3 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <KeyIcon className="h-5 w-5 mr-3" />
                  Change Password
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {/* Modals */}
        <PaymentReceiptModal
          isOpen={isPaymentModalOpen}
          closeModal={() => setIsPaymentModalOpen(false)}
          clientName={client?.Name || ''}
          selectedBlock={selectedBalanceData?.Block}
          selectedLot={selectedBalanceData?.Lot}
          balanceRecords={balanceRecords}
        />

        <ViewPaymentModal
          isOpen={isViewPaymentModalOpen}
          onClose={() => setIsViewPaymentModalOpen(false)}
          payments={payments}
          isLoading={isLoadingPayments}
          clientName={client?.Name || ''}
        />

        <TicketSubmissionModal
          isOpen={isTicketModalOpen}
          closeModal={() => setIsTicketModalOpen(false)}
          clientName={client?.Name || ''}
          refreshTickets={fetchClientTicketsForComponent}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          closeModal={() => setIsChangePasswordModalOpen(false)}
          userId={userId}
          onSuccess={() => {
            toast.success('Password changed successfully');
            setIsChangePasswordModalOpen(false);
          }}
        />
      </div>
    </PageTransition>
  );
};

export default ClientDashboardPage;
