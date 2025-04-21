import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onSave: (updatedProperty: any) => void;
  isLivingWater: boolean;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ isOpen, onClose, property, onSave, isLivingWater }) => {
  const [formState, setFormState] = useState<any>(property || {});
  
  React.useEffect(() => {
    setFormState(property || {});
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSave = () => {
    onSave(formState);
  };

  const lwFields = [
    { label: 'Block', name: 'Block' },
    { label: 'Lot', name: 'Lot' },
    { label: 'Owner', name: 'Owner' },
    { label: 'Amount', name: 'Amount', type: 'number' },
    { label: 'Realty', name: 'Realty' },
    { label: 'Seller Name', name: 'Seller Name' },
    { label: 'Broker / Realty', name: 'Broker / Realty' },
    { label: 'Reservation', name: 'Reservation', type: 'number' },
    { label: 'Lot Area', name: 'Lot Area', type: 'number' },
    { label: 'Price per sqm', name: 'Price per sqm', type: 'number' },
    { label: 'TCP', name: 'TCP', type: 'number' },
    { label: 'TSP', name: 'TSP', type: 'number' },
    { label: 'MISC FEE', name: 'MISC FEE', type: 'number' },
    { label: 'Net Contract Price', name: 'Net Contract Price', type: 'number' },
    { label: 'First MA', name: 'First MA', type: 'number' },
    { label: '1st MA net of Advance Payment', name: '1st MA net of Advance Payment', type: 'number' },
    { label: '2ndto60th MA', name: '2ndto60th MA', type: 'number' },
    { label: 'Optional: Advance Payment', name: 'Optional: Advance Payment', type: 'number' }
  ];

  const hhFields = [
    { label: 'Block', name: 'Block' },
    { label: 'Lot', name: 'Lot' },
    { label: 'Buyers Name', name: 'Buyers Name' },
    { label: 'Amount', name: 'Amount', type: 'number' },
    { label: 'Realty', name: 'Realty' },
    { label: 'Seller Name', name: 'Seller Name' },
    { label: 'Sales Director', name: 'Sales Director' },
    { label: 'Broker', name: 'Broker' },
    { label: 'Lot Size', name: 'Lot Size', type: 'number' },
    { label: 'Price', name: 'Price', type: 'number' },
    { label: 'Payment Scheme', name: 'Payment Scheme' },
    { label: 'Vat Status', name: 'Vat Status' },
    { label: 'TSP', name: 'TSP', type: 'number' },
    { label: 'Mode of Payment', name: 'Mode of Payment' },
    { label: 'Reservation', name: 'Reservation', type: 'number' },
    { label: 'Comm Price', name: 'Comm Price', type: 'number' },
    { label: 'Misc Fee', name: 'Misc Fee', type: 'number' },
    { label: 'Vat', name: 'Vat', type: 'number' },
    { label: 'TCP', name: 'TCP', type: 'number' },
    { label: '1ST MA', name: '1ST MA', type: 'number' },
    { label: '1ST MA with Holding Fee', name: '1ST MA with Holding Fee', type: 'number' },
    { label: '2ND TO 48TH MA', name: '2ND TO 48TH MA', type: 'number' },
    { label: 'NEW TERM', name: 'NEW TERM' },
    { label: 'PASALO PRICE', name: 'PASALO PRICE', type: 'number' },
    { label: 'NEW MA', name: 'NEW MA', type: 'number' }
  ];

  const fields = isLivingWater ? lwFields : hhFields;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Edit Property
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  {fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={formState[field.name] ?? ''}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-[#0A0D50] focus:border-[#0A0D50] sm:text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-[#0A0D50] text-white hover:bg-[#23277c]"
                    >
                      Save Changes
                    </button>
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

export default EditPropertyModal;
