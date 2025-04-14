import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBalanceData) => Promise<void>;
  onDelete: () => void;
  data: EditBalanceData | null;
}

export interface EditBalanceData {
  id: number;
  "Project": string;
  "Block": string;
  "Lot": string;
  "Name": string;
  "Remaining Balance": number | null;
  "Amount": number | null;
  "TCP": number | null;
  "Months Paid": string;
  "MONTHS PAID": string;
  "Terms": string;
  "Penalty"?: number | null;
  "Payment Type"?: string;
  "Due Date"?: string | null;
}

interface PaymentRecord {
  "Name": string;
  "Amount": number;
  "Project": string;
  "Block": string;
  "Lot": string;
  "Payment Type": string;
  "Penalty"?: number;
  "Payment for the Month of": string;
  "Due Date"?: string;
}

const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ isOpen, onClose, onSave, data }) => {
  const [formData, setFormData] = React.useState<EditBalanceData | null>(data);
  const [loading, setLoading] = React.useState(false);
  const [currentRemainingBalance, setCurrentRemainingBalance] = React.useState<number | null>(data?.["Remaining Balance"] || 0);
  const [totalAmount, setTotalAmount] = React.useState<number | null>(data?.Amount || 0);
  const [penalty, setPenalty] = React.useState<number | null>(null);
  const [paymentType, setPaymentType] = React.useState<string>('GCASH');
  const [paymentMonth, setPaymentMonth] = React.useState<string>('');
  const [dueDate, setDueDate] = React.useState<string>('15th');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const paymentTypes = [
    'GCASH',
    'SB-HRM',
    'SB-LWS',
    'SB-HHE',
    'CBS-LWS',
    'CBS-HHE'
  ];

  React.useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        "Amount": null,
        "Penalty": null,
        "Payment Type": 'cash'
      });
      setCurrentRemainingBalance(data["Remaining Balance"]);
      setTotalAmount(data.Amount);
      setPenalty(null);
      setPaymentType('cash');
    }
  }, [data]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !data) return;

    try {
      setLoading(true);
      // Get the current values
      const currentAmount = data.Amount || 0;
      const currentMonthsPaid = parseInt(data['MONTHS PAID'] || '0');
      const newPaymentAmount = formData['Amount'] ? parseFloat(formData['Amount'].toString()) : 0;
      const currentRemainingBalance = data["Remaining Balance"] || 0;
      
      // Calculate new values
      const newTotalAmount = currentAmount + newPaymentAmount;
      const newRemainingBalance = currentRemainingBalance - newPaymentAmount;
      const newMonthsPaid = currentMonthsPaid + 1; // Increment months paid by 1

      // Update the Balance table with all the data
      const updatedData = {
        ...data, // Keep all existing data
        ...formData, // Override with any changed fields
        'Remaining Balance': newRemainingBalance,
        'Amount': newTotalAmount,
        'MONTHS PAID': newMonthsPaid.toString(),
        'Due Date': dueDate
      };

      // First update the Balance table
      await onSave(updatedData);

      // Then save basic payment info to Payment Record table
      const paymentRecord: PaymentRecord = {
        "Name": data.Name,
        "Amount": newPaymentAmount,
        "Project": data.Project,
        "Block": data.Block,
        "Lot": data.Lot,
        "Payment Type": paymentType,
        "Payment for the Month of": paymentMonth,
        "Due Date": dueDate,
      };

      // Only add penalty if it has a value
      if (penalty !== null && penalty > 0) {
        paymentRecord["Penalty"] = penalty;
      }

      const { error: paymentError } = await supabase
        .from('Payment Record')
        .insert([paymentRecord]);

      if (paymentError) {
        throw paymentError;
      }

      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
      alert('Error saving payment: ' + (error as any)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'Amount') {
      // Allow empty value to clear the field
      if (value === '') {
        setFormData(prev => prev ? {
          ...prev,
          [field]: null
        } : null);
        setCurrentRemainingBalance(formData?.TCP || 0);
        setTotalAmount(data?.Amount || 0);
        return;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      
      setFormData(prev => prev ? {
        ...prev,
        [field]: numValue
      } : null);

      // Calculate new remaining balance and update total amount
      if (formData?.TCP) {
        const newBalance = formData.TCP - (data?.Amount || 0) - numValue;
        setCurrentRemainingBalance(newBalance);
        setTotalAmount((data?.Amount || 0) + numValue);
      }
    } else if (field === 'Penalty') {
      if (value === '') {
        setPenalty(null);
        return;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      setPenalty(numValue);
    } else {
      setFormData(prev => prev ? {
        ...prev,
        [field]: value
      } : null);
    }
  };

  return (
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
                <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                    <div>
                      <span>Add Payment</span>
                      <p className="mt-1 text-sm font-normal text-gray-500">Record a new payment for this client</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1.5"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                  <div className="space-y-4">
                    {/* Client Information Section */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-gray-700 flex items-center space-x-2">
                        <span className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                        </span>
                        <span>Client Information</span>
                      </h4>
                      <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Project:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData.Project}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Block:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData.Block}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Lot:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData.Lot}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData.Name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Remaining Balance:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(currentRemainingBalance || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(totalAmount || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">TCP:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(formData['TCP'] || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Months Paid:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData['Months Paid']}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">MONTHS PAID:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData['MONTHS PAID'] || ''}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Terms:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData['Terms']}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details Section */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-gray-700 flex items-center space-x-2">
                        <span className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                        </span>
                        <span>Payment Details</span>
                      </h4>
                      <div className="grid gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                              <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">
                                Amount
                              </label>
                              <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">₱</span>
                                </div>
                                <input
                                  type="number"
                                  id="amount"
                                  value={formData?.Amount || ''}
                                  onChange={(e) => handleInputChange('Amount', e.target.value)}
                                  className="block w-full rounded-md border-0 bg-white pl-7 pr-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                              <label htmlFor="penalty" className="block text-sm font-medium text-gray-600 mb-1">
                                Penalty
                              </label>
                              <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">₱</span>
                                </div>
                                <input
                                  type="number"
                                  id="penalty"
                                  value={penalty || ''}
                                  onChange={(e) => handleInputChange('Penalty', e.target.value)}
                                  className="block w-full rounded-md border-0 bg-white pl-7 pr-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                            <label htmlFor="paymentMonth" className="block text-sm font-medium text-gray-600 mb-1">
                              Payment for the Month of
                            </label>
                            <select
                              id="paymentMonth"
                              value={paymentMonth}
                              onChange={(e) => setPaymentMonth(e.target.value)}
                              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                              required
                            >
                              <option value="">Select Month</option>
                              {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                          </div>

                        <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-600 mb-1">
                            Payment Type
                          </label>
                          <select
                            id="paymentType"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                          >
                            {paymentTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-600 mb-1">
                            Due Date
                          </label>
                          <select
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                            required
                          >
                            <option value="15th">15th</option>
                            <option value="30th">30th</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                            <label htmlFor="monthsPaid" className="block text-sm font-medium text-gray-600 mb-1">
                              Months Paid
                            </label>
                            <input
                              type="text"
                              id="monthsPaid"
                              value={formData?.["Months Paid"] || ''}
                              onChange={(e) => handleInputChange("Months Paid", e.target.value)}
                              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                              placeholder="e.g. March 22 - February 25"
                            />
                          </div>

                          <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                            <label htmlFor="MONTHSPAID" className="block text-sm font-medium text-gray-600 mb-1">
                              MONTHS PAID
                            </label>
                            <input
                              type="text"
                              id="MONTHSPAID"
                              value={formData?.["MONTHS PAID"] || ''}
                              onChange={(e) => handleInputChange("MONTHS PAID", e.target.value)}
                              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                              placeholder="e.g. 37"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditBalanceModal;
