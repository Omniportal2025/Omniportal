import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditBalanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBalanceDetailsData) => void;
  data: EditBalanceDetailsData | null;
}

export interface EditBalanceDetailsData {
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
  "Due Date"?: string | null;
}

const EditBalanceDetailsModal: React.FC<EditBalanceDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  data
}) => {
  const [formData, setFormData] = useState<EditBalanceDetailsData | null>(null);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  };

  const handleInputChange = (field: keyof EditBalanceDetailsData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-2xl p-6 my-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
              <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                  <span>Edit Balance Details</span>
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
                    <div className="grid gap-3">
                      <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData?.Name || ''}
                          onChange={(e) => handleInputChange('Name', e.target.value)}
                          className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                          placeholder="Enter client name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                          <label htmlFor="block" className="block text-sm font-medium text-gray-600 mb-1">
                            Block
                          </label>
                          <input
                            type="text"
                            id="block"
                            value={formData?.Block || ''}
                            disabled
                            className="block w-full rounded-md border-0 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-0 sm:text-sm cursor-not-allowed"
                            placeholder="Enter block"
                          />
                        </div>

                        <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                          <label htmlFor="lot" className="block text-sm font-medium text-gray-600 mb-1">
                            Lot
                          </label>
                          <input
                            type="text"
                            id="lot"
                            value={formData?.Lot || ''}
                            disabled
                            className="block w-full rounded-md border-0 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-0 sm:text-sm cursor-not-allowed"
                            placeholder="Enter lot"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                        <label htmlFor="project" className="block text-sm font-medium text-gray-600 mb-1">
                          Project
                        </label>
                        <input
                          type="text"
                          id="project"
                          value={formData?.Project || ''}
                          disabled
                          className="block w-full rounded-md border-0 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-0 sm:text-sm cursor-not-allowed"
                          placeholder="Enter project name"
                        />
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
                          <label htmlFor="monthsPaid" className="block text-sm font-medium text-gray-600 mb-1">
                            Months Paid
                          </label>
                          <input
                            type="text"
                            id="monthsPaid"
                            value={formData?.["Months Paid"] || ''}
                            onChange={(e) => handleInputChange('Months Paid', e.target.value)}
                            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                            placeholder="Enter months paid"
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
                            onChange={(e) => handleInputChange('MONTHS PAID', e.target.value)}
                            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                            placeholder="Enter MONTHS PAID"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
                          <label htmlFor="tcp" className="block text-sm font-medium text-gray-600 mb-1">
                            TCP
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">₱</span>
                            </div>
                            <input
                              type="number"
                              id="tcp"
                              value={formData?.TCP || ''}
                              onChange={(e) => handleInputChange('TCP', parseFloat(e.target.value) || null)}
                              className="block w-full rounded-md border-0 bg-white pl-7 pr-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

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
                              onChange={(e) => handleInputChange('Amount', parseFloat(e.target.value) || null)}
                              className="block w-full rounded-md border-0 bg-white pl-7 pr-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
  <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
    <label htmlFor="terms" className="block text-sm font-medium text-gray-600 mb-1">
      Terms
    </label>
    <input
      type="text"
      id="terms"
      value={formData?.Terms || ''}
      onChange={(e) => handleInputChange('Terms', e.target.value)}
      className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
      placeholder="Enter terms"
    />
  </div>

  {/* Due Date Field */}
  <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-600 mb-1">
      Due Date
    </label>
    <select
  id="dueDate"
  value={formData?.["Due Date"] || ''}
  onChange={(e) => {
    const value = e.target.value;
    setFormData(prev => prev ? { ...prev, ["Due Date"]: value } : null);
  }}
  className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
  required
>
  <option value="">Select Due Date</option>
  <option value="15th">15th</option>
  <option value="30th">30th</option>
</select>
  </div>

  <div className="bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition-all">
    <label htmlFor="remainingBalance" className="block text-sm font-medium text-gray-600 mb-1">
      Remaining Balance
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 sm:text-sm">₱</span>
      </div>
      <input
        type="number"
        id="remainingBalance"
        value={formData?.["Remaining Balance"] || ''}
        onChange={(e) => handleInputChange('Remaining Balance', parseFloat(e.target.value) || null)}
        className="block w-full rounded-md border-0 bg-white pl-7 pr-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all"
        placeholder="0.00"
      />
    </div>
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
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditBalanceDetailsModal;
