import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Client {
  id: number;
  Name: string;
  Email?: string | null;
  auth_id?: string | null;
  is_active?: boolean;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  closeModal: () => void;
  clientName: string;
  clientId: number;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, closeModal, clientName, clientId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientHasAccount, setClientHasAccount] = useState(false);

  useEffect(() => {
    // Check if client already has an account when modal opens
    const checkClientAccount = async () => {
      try {
        const { data, error } = await supabase
          .from('Clients')
          .select('auth_id')
          .eq('id', clientId)
          .single();
        
        if (error) throw error;
        
        if (data && data.auth_id) {
          setClientHasAccount(true);
          setError("This client already has an account. Please use a different client.");
        } else {
          setClientHasAccount(false);
          setError(null);
        }
      } catch (err) {
        console.error("Error checking client account:", err);
      }
    };

    if (isOpen) {
      checkClientAccount();
    }
  }, [isOpen, clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First update the client with the email
      const { error: emailUpdateError } = await supabase
        .from('Clients')
        .update({ Email: email })
        .eq('id', clientId);

      if (emailUpdateError) throw emailUpdateError;

      // Then create auth user with email confirmation
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://omniportal2025.github.io/Omniportal/login',
          data: {
            is_client: true,
            client_name: clientName,
            client_email: email,
            client_password: password
          }
        }
      });

      if (authError) {
        // If auth creation fails, remove the email from the client
        await supabase
          .from('Clients')
          .update({ Email: null })
          .eq('id', clientId);
        throw authError;
      }

      // Get the auth_id from the created user
      const auth_id = data?.user?.id;
      
      if (!auth_id) {
        // If no auth_id, remove the email from the client
        await supabase
          .from('Clients')
          .update({ Email: null })
          .eq('id', clientId);
        throw new Error('Failed to get auth_id');
      }

      console.log("User created:", data.user);
      
      // Update client with auth_id
      const { error: updateError } = await supabase
        .from('Clients')
        .update({ auth_id: auth_id })
        .eq('id', clientId);

      if (updateError) {
        // If update fails, we should delete the auth user to maintain consistency
        await supabase.auth.admin.deleteUser(auth_id);
        throw updateError;
      }

      // Check if email confirmation is required
      if (data.user?.identities?.[0]?.identity_data?.email_confirmed_at === null) {
        console.log("Email confirmation required. Check your email inbox.");
        setSuccess(true);
        alert("Account created! Please check your email to confirm your account. The email contains login credentials.");
      } else {
        console.log("Email already confirmed or confirmation bypassed");
      }

      setSuccess(true);
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setEmail('');
        setPassword('');
      }, 3000);
    } catch (err: any) {
      console.error("Account creation error:", err);
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
                <div className="absolute top-0 right-0 pt-6 pr-6">
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Create Account
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Setting up an account for <span className="font-medium text-gray-900">{clientName}</span>
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
                      <p className="mt-4 text-lg font-semibold text-green-800">Account created successfully!</p>
                      <p className="mt-2 text-sm text-green-700">An email has been sent with login credentials and instructions.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                          Email address
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                            placeholder="Enter client's email address"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                          Password
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                            placeholder="Enter a secure password"
                            required
                            minLength={6}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                          <svg className="mr-1.5 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                          </svg>
                          Password must be at least 6 characters
                        </p>
                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                          <svg className="mr-1.5 h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                          </svg>
                          These credentials will be sent to the client's email
                        </p>
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

                    {clientHasAccount && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">This client already has an account. Please use a different client.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading || clientHasAccount}
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          clientHasAccount 
                            ? 'text-gray-500 bg-gray-50 cursor-not-allowed' 
                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            {clientHasAccount ? (
                              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a4 4 0 100 8 4 4 0 000-8zM5.293 9.707a1 1 0 011.414 0L10 13l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10-4a1 1 0 00-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {clientHasAccount ? 'Account Exists' : 'Create Account'}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Success message removed to avoid duplication */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [accountStatus, setAccountStatus] = useState<'all' | 'with_account' | 'without_account'>('all');
  const [livingWaterOwners, setLivingWaterOwners] = useState<string[]>([]);
  const [havahillsBuyers, setHavahillsBuyers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName'>('firstName');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  const itemsPerPage = 15;
  const projects = ['Living Water Subdivision', 'Havahills Estate'];

  useEffect(() => {
    fetchClients();
    fetchLivingWaterOwners();
    fetchHavahillsBuyers();
  }, []);

  useEffect(() => {
    console.log('Sort by changed to:', sortBy);
    fetchClients();
  }, [sortBy]);

  const fetchLivingWaterOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('Living Water Subdivision')
        .select('Owner');

      if (error) throw error;

      const owners = data?.map(item => item.Owner) || [];
      console.log('Living Water Owners:', owners);
      setLivingWaterOwners(owners);
    } catch (error) {
      console.error('Error fetching Living Water owners:', error);
    }
  };

  const fetchHavahillsBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from('Havahills Estate')
        .select('"Buyers Name"');

      if (error) throw error;

      const buyers = data?.map(item => item['Buyers Name']) || [];
      console.log('Havahills Buyers:', buyers);
      setHavahillsBuyers(buyers);
    } catch (error) {
      console.error('Error fetching Havahills buyers:', error);
    }
  };

  useEffect(() => {
    let filtered = [...clients];

    // Apply project filter
    if (selectedProject !== 'all') {
      console.log('Selected Project:', selectedProject);
      console.log('Current Clients:', clients);
      console.log('Living Water Owners:', livingWaterOwners);
      console.log('Havahills Buyers:', havahillsBuyers);
      
      filtered = filtered.filter(client => {
        if (selectedProject === 'Living Water Subdivision') {
          const isMatch = livingWaterOwners.some(owner => 
            owner?.toLowerCase() === client.Name?.toLowerCase()
          );
          console.log(`Checking ${client.Name} against Living Water:`, isMatch);
          return isMatch;
        } else if (selectedProject === 'Havahills Estate') {
          const isMatch = havahillsBuyers.some(buyer => 
            buyer?.toLowerCase() === client.Name?.toLowerCase()
          );
          console.log(`Checking ${client.Name} against Havahills:`, isMatch);
          return isMatch;
        }
        return true;
      });
      
      console.log('Filtered Clients:', filtered);
    }

    // Apply account status filter
    if (accountStatus !== 'all') {
      filtered = filtered.filter(client => {
        if (accountStatus === 'with_account') {
          return !!client.auth_id;
        } else {
          return !client.auth_id;
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClients(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchQuery, selectedProject, livingWaterOwners, havahillsBuyers, accountStatus]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients with sort by:', sortBy);
      
      // Always fetch by Name since we don't have separate firstName/lastName columns
      const { data, error } = await supabase
        .from('Clients')
        .select('id, Name, Email, auth_id, is_active')
        .order('Name', { ascending: true });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Fetched clients data:', data);
      
      // Sort the data client-side based on first or last name
      let sortedData = [...(data || [])];
      console.log('Applying client-side sorting for:', sortBy);
      sortedData.sort((a, b) => {
        // Make sure Name exists and is a string
        const nameA = typeof a.Name === 'string' ? a.Name : '';
        const nameB = typeof b.Name === 'string' ? b.Name : '';
        
        const nameParts_a = nameA.split(' ');
        const nameParts_b = nameB.split(' ');
        
        console.log('Comparing names:', nameA, nameB);
        
        if (sortBy === 'firstName') {
          // Compare first parts of names
          const firstName_a = nameParts_a.length > 0 ? nameParts_a[0] : '';
          const firstName_b = nameParts_b.length > 0 ? nameParts_b[0] : '';
          console.log('First names:', firstName_a, firstName_b);
          return firstName_a.localeCompare(firstName_b);
        } else if (sortBy === 'lastName') {
          // Compare last parts of names
          const lastName_a = nameParts_a.length > 1 ? nameParts_a[nameParts_a.length - 1] : '';
          const lastName_b = nameParts_b.length > 1 ? nameParts_b[nameParts_b.length - 1] : '';
          console.log('Last names:', lastName_a, lastName_b);
          return lastName_a.localeCompare(lastName_b);
        }
        return 0;
      });
      console.log('Sorted data:', sortedData.map(c => c.Name));
      
      setClients(sortedData);
      setFilteredClients(sortedData);
      setTotalPages(Math.ceil((sortedData?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Get current page's clients
  const getCurrentPageClients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDelete = async (client: Client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      // Update the client record to remove auth_id and Email
      const { error: updateError } = await supabase
        .from('Clients')
        .update({
          auth_id: null,
          Email: null
        })
        .eq('id', clientToDelete.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setClients(prevClients =>
        prevClients.map(c => {
          if (c.id === clientToDelete.id) {
            return { ...c, auth_id: null, Email: null };
          }
          return c;
        })
      );

      setShowDeleteConfirm(false);
      setClientToDelete(null);

      // Show success message
      alert('Client account access removed successfully');
    } catch (error: any) {
      console.error('Error removing client account access:', error);
      alert('Failed to remove client account access. Make sure you have admin privileges.');
    }
  };

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all clients in the system.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm sm:leading-6 shadow-sm"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right-aligned dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="w-full sm:w-48">
            <div className="relative rounded-lg shadow-sm">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'firstName' | 'lastName')}
                className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm sm:leading-6 appearance-none cursor-pointer shadow-sm"
              >
                <option value="firstName">Sort by First Name</option>
                <option value="lastName">Sort by Last Name</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.04 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Project Filter Dropdown */}
          <div className="w-full sm:w-48">
            <div className="relative rounded-lg shadow-sm">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm sm:leading-6 appearance-none cursor-pointer shadow-sm"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.04 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Account Status Filter Dropdown */}
          <div className="w-full sm:w-48">
            <div className="relative rounded-lg shadow-sm">
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as 'all' | 'with_account' | 'without_account')}
                className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm sm:leading-6 appearance-none cursor-pointer shadow-sm"
              >
                <option value="all">All Accounts</option>
                <option value="with_account">With Account</option>
                <option value="without_account">Without Account</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.04 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="table-scrollbar overflow-hidden bg-white shadow-lg ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {loading ? (
                  <div className="flex justify-center items-center h-32 bg-gray-50">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent shadow-sm"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 bg-[#0A0D50] z-10">
                        <tr>
                          <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                            Name
                          </th>
                          <th scope="col" className="relative py-4 pl-3 pr-6 text-right text-xs font-medium uppercase tracking-wider text-white">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {getCurrentPageClients().map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {client.Name}
                              {client.auth_id && (
                                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg className="h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Has Account
                                </span>
                              )}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setIsModalOpen(true);
                                  }}
                                  disabled={!!client.auth_id}
                                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    client.auth_id 
                                      ? 'text-gray-500 bg-gray-50 cursor-not-allowed' 
                                      : 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'
                                  }`}
                                  title={client.auth_id ? 'Client already has an account' : 'Create account for this client'}
                                >
                                  {client.auth_id ? (
                                    <span className="flex items-center gap-1.5">
                                      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 100 8 4 4 0 000-8zM5.293 9.707a1 1 0 011.414 0L10 13l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5">
                                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10-4a1 1 0 00-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                  {client.auth_id ? 'Account Exists' : 'Create Account'}
                                </button>
                                {client.auth_id && (
                                  <button
                                    onClick={() => handleDelete(client)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 transition-all duration-200"
                                    title="Delete client account"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      Delete
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="relative ml-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredClients.length)}</span> to{' '}
                            <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{filteredClients.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex space-x-1" aria-label="Pagination">
                            <button
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-lg p-2 text-gray-400 hover:text-blue-600 focus:z-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <span className="sr-only">Previous</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5 4.25a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-700">Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span></span>
                            </div>
                            <button
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center rounded-lg p-2 text-gray-400 hover:text-blue-600 focus:z-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <span className="sr-only">Next</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.04l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06.02z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {!loading && filteredClients.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 bg-gray-50 text-center px-6">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                    <p className="mt-1 text-sm text-gray-500">{searchQuery ? 'Try adjusting your search term' : 'No clients available at the moment'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedClient && (
        <CreateAccountModal
          isOpen={isModalOpen}
          closeModal={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          clientName={selectedClient.Name}
          clientId={selectedClient.id}
        />
      )}
      {showDeleteConfirm && clientToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Client Account</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the account for <span className="font-medium text-gray-900">{clientToDelete.Name}</span>?
                    This action cannot be undone and all account data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setClientToDelete(null);
                }}
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
