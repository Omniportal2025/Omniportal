import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import EditBalanceModal, { EditBalanceData } from '../components/EditBalanceModal';
import EditBalanceDetailsModal, { EditBalanceDetailsData } from '../components/EditBalanceDetailsModal';

interface BalanceData {
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
  "Due Date": string | null;
}

type SortType = 'name-asc' | 'name-desc' | 'block-lot-asc' | 'block-lot-desc';

const PROJECTS = ['Living Water Subdivision', 'Havahills Estate'];

const formatCurrency = (value: number | null): string => {
  if (value == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const BalancePage: FC = () => {
  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<BalanceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [sortType, setSortType] = useState<SortType>('name-asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Balance')
        .select('id, "Project", "Block", "Lot", "Name", "Remaining Balance", "Amount", "TCP", "Months Paid", "MONTHS PAID", "Terms", "Due Date"')
        .order('"Name"', { ascending: true });

      if (error) throw error;

      const processedData = (data || []).map(item => ({
        ...item,
        "Remaining Balance": item["Remaining Balance"] ? parseFloat(item["Remaining Balance"].toString().replace(/,/g, '')) : null,
        "Amount": item["Amount"] ? parseFloat(item["Amount"].toString().replace(/,/g, '')) : null,
        "TCP": item["TCP"] ? parseFloat(item["TCP"].toString().replace(/,/g, '')) : null,
        "Months Paid": item["Months Paid"]?.toString() || '',
        "MONTHS PAID": item["MONTHS PAID"]?.toString() || '',
        "Terms": item["Terms"]?.toString() || ''
      }));

      setBalances(processedData);
    } catch (err: any) {
      console.error('Error fetching balances:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setIsEditModalOpen(true);
  };

  const handleEditDetails = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setIsEditDetailsModalOpen(true);
  };

  const handleSave = async (updatedData: EditBalanceData) => {
    try {
      // Update the Balance record with the new data
      const { error } = await supabase
        .from('Balance')
        .update({
          "Project": updatedData["Project"],
          "Block": updatedData["Block"],
          "Lot": updatedData["Lot"],
          "Name": updatedData["Name"],
          "Remaining Balance": updatedData["Remaining Balance"],
          "Amount": updatedData["Amount"],
          "TCP": updatedData["TCP"],
          "Months Paid": updatedData["Months Paid"],
          "MONTHS PAID": updatedData["MONTHS PAID"],
          "Terms": updatedData["Terms"]
        })
        .eq('id', updatedData.id);

      if (error) throw error;

      // Refresh the balances list
      await fetchBalances();
    } catch (err: any) {
      console.error('Error updating balance:', err.message);
      setError(err.message);
    }
  };

  const handleSaveDetails = async (updatedData: EditBalanceDetailsData) => {
    try {
      const { error } = await supabase
        .from('Balance')
        .update({
          Name: updatedData.Name,
          Block: updatedData.Block,
          Lot: updatedData.Lot,
          Project: updatedData.Project,
          Terms: updatedData.Terms,
          TCP: updatedData.TCP,
          Amount: updatedData.Amount,
          "Remaining Balance": updatedData["Remaining Balance"],
          "Months Paid": updatedData["Months Paid"],
          "MONTHS PAID": updatedData["MONTHS PAID"],
          "Due Date": updatedData["Due Date"]
        })
        .eq('id', updatedData.id);

      if (error) throw error;

      // Fetch fresh data from the database
      await fetchBalances();

      setIsEditDetailsModalOpen(false);
      setSelectedBalance(null);
    } catch (error: any) {
      console.error('Error updating balance:', error.message);
      alert('Failed to update balance: ' + error.message);
    }
  };

  const handleDelete = async (balance: BalanceData) => {
    try {
      const { error } = await supabase
        .from('Balance')
        .delete()
        .eq('id', balance.id);

      if (error) throw error;

      await fetchBalances();
      setShowDeleteConfirm(false);
      setSelectedBalance(null);
    } catch (err: any) {
      console.error('Error deleting balance record:', err.message);
    }
  };

  const handleDeleteConfirm = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setShowDeleteConfirm(true);
  };

  const handleView = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setIsViewModalOpen(true);
  };

  const compareBlockLot = (a: BalanceData, b: BalanceData): number => {
    // Handle null/undefined cases
    const blockA = (a.Block || '').toString();
    const blockB = (b.Block || '').toString();
    const lotA = (a.Lot || '').toString();
    const lotB = (b.Lot || '').toString();

    // Extract numeric parts from Block
    const blockNumA = parseInt(blockA.replace(/\D/g, '') || '0');
    const blockNumB = parseInt(blockB.replace(/\D/g, '') || '0');

    if (blockNumA !== blockNumB) {
      return blockNumA - blockNumB;
    }

    // If blocks are the same, compare lots
    const lotNumA = parseInt(lotA.replace(/\D/g, '') || '0');
    const lotNumB = parseInt(lotB.replace(/\D/g, '') || '0');
    return lotNumA - lotNumB;
  };

  const isPaymentCompleted = (balance: any) => {
    return balance["Amount"] === balance["TCP"] && balance["MONTHS PAID"] === balance["Terms"];
  };

  const renderActionButtons = (balance: any) => {
    if (isPaymentCompleted(balance)) {
      return (
        <div className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payment Completed
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEditDetails(balance)}
          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200 group"
          title="Edit Balance"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="ml-1">Edit</span>
          </span>
        </button>
        {!isPaymentCompleted(balance) && (
          <button
            onClick={() => handleEdit(balance)}
            className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200 group"
            title="Add Payment"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="ml-1">Add Payment</span>
            </span>
          </button>
        )}
      </div>
    );
  };

  // Filter and sort balances
  const filteredBalances = useMemo(() => {
    try {
      let filtered = [...balances];

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(balance => {
          try {
            const name = String(balance.Name || '').toLowerCase();
            const block = String(balance.Block || '').toLowerCase();
            const lot = String(balance.Lot || '').toLowerCase();
            const project = String(balance.Project || '').toLowerCase();
            
            return name.includes(searchLower) || 
                   block.includes(searchLower) || 
                   lot.includes(searchLower) || 
                   project.includes(searchLower);
          } catch (err) {
            console.error('Error filtering balance:', err);
            return false;
          }
        });
      }

      // Apply project filter
      if (selectedProject) {
        filtered = filtered.filter(balance => balance.Project === selectedProject);
      }

      return filtered;
    } catch (err) {
      console.error('Error in filteredBalances:', err);
      return balances;
    }
  }, [balances, searchTerm, selectedProject]);

  // Sort the filtered balances
  const sortedBalances = useMemo(() => {
    return [...filteredBalances].sort((a, b) => {
      const nameA = a.Name || '';
      const nameB = b.Name || '';

      if (sortType === 'name-asc') return nameA.localeCompare(nameB);
      if (sortType === 'name-desc') return nameB.localeCompare(nameA);
      if (sortType === 'block-lot-asc') {
        return compareBlockLot(a, b);
      }
      return compareBlockLot(b, a); // Reverse for descending order
    });
  }, [filteredBalances, sortType]);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Balance Records</h1>
            <p className="text-gray-600">Manage and view client balances</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-16rem)]">
            <div className="flex justify-center items-center h-full bg-gray-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-sm"></div>
                <p className="mt-4 text-sm font-medium text-gray-500">Loading balance records...</p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Balance Records</h1>
            <p className="text-gray-600">Manage and view client balances</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
            <div className="flex items-center text-red-600">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error loading balance data: {error}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Balance Records</h1>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{filteredBalances.length}</span>
              <span className="ml-1">records found</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          {/* Search Bar */}
          <div className="w-72">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full h-10 pl-3 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-4">
            {/* Project Filter */}
            <div className="w-48">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Projects</option>
                {PROJECTS.map((project, index) => (
                  <option key={index} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="w-48">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="block-lot-asc">Sort by Block/Lot ↑</option>
                <option value="block-lot-desc">Sort by Block/Lot ↓</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-16rem)] border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <span className="text-sm font-medium text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedBalances.length}</span> records
            </span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-[#0A0D50] z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Block
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Lot
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Remaining Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    TCP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Months Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    MONTHS PAID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Terms
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBalances.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No balance records found</h3>
                        <p className="mt-1 text-sm text-gray-500">{searchTerm ? 'Try adjusting your search or filter criteria' : 'No records available at the moment'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedBalances.map((balance) => (
                    <tr key={balance.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance.Project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance.Block}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance.Lot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(balance["Remaining Balance"])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(balance["Amount"])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(balance["TCP"])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance["Months Paid"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance["MONTHS PAID"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance["Terms"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance["Due Date"] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2 flex">
                        <button
                          onClick={() => handleView(balance)}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                        {renderActionButtons(balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isEditModalOpen && selectedBalance && (
          <EditBalanceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBalance(null);
              setShowDeleteConfirm(false);
            }}
            onSave={handleSave}
            onDelete={() => setShowDeleteConfirm(true)}
            data={selectedBalance}
          />
        )}

        {/* Edit Balance Details Modal */}
        {isEditDetailsModalOpen && selectedBalance && (
          <EditBalanceDetailsModal
            isOpen={isEditDetailsModalOpen}
            onClose={() => {
              setIsEditDetailsModalOpen(false);
              setSelectedBalance(null);
            }}
            onSave={handleSaveDetails}
            data={selectedBalance}
          />
        )}

        {/* Statement of Account Modal */}
        {isViewModalOpen && selectedBalance && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all scale-100 opacity-100">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <span className="bg-[#0A0D50] text-white p-1.5 rounded-lg">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      Statement of Account
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedBalance.Name} • {selectedBalance.Project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Statement of Account</title>
                                <style media="print">
                                  @page {
                                    size: auto;
                                    margin: 0mm;
                                  }
                                </style>
                                <style>
                                  @media print {
                                    @page { 
                                      size: A5;
                                      margin: 0;
                                    }
                                    body { 
                                      -webkit-print-color-adjust: exact;
                                      print-color-adjust: exact;
                                    }
                                    .print-container {
                                      border: none !important;
                                      box-shadow: none !important;
                                    }
                                  }
                                  @page {
                                    margin: 0;
                                  }
                                  @media print {
                                    html, body {
                                      height: 100%;
                                      margin: 0 !important;
                                      padding: 0 !important;
                                    }
                                  }
                                  body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.3;
                                    color: #333;
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    justify-content: center;
                                    align-items: flex-start;
                                    min-height: 100vh;
                                    background: #f5f5f5;
                                  }
                                  .print-container {
                                    background: white;
                                    width: 400px;
                                    padding: 20px;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                  }
                                  .header {
                                    text-align: center;
                                    padding: 8px 0;
                                    margin-bottom: 15px;
                                    border-bottom: 2px solid #0A0D50;
                                  }
                                  .header h2 {
                                    margin: 0;
                                    color: #0A0D50;
                                    font-size: 18px;
                                    font-weight: bold;
                                  }
                                  .header p {
                                    margin: 3px 0 0;
                                    color: #666;
                                    font-size: 12px;
                                  }
                                  .property-details {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 15px;
                                    padding: 8px;
                                    background: #f8fafc;
                                    border-radius: 4px;
                                    font-size: 12px;
                                  }
                                  .badge {
                                    background: #e0e7ff;
                                    color: #3730a3;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    font-weight: 500;
                                  }
                                  .financial-grid {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 10px;
                                    margin-bottom: 15px;
                                  }
                                  .card {
                                    background: #fff;
                                    border: 1px solid #e5e7eb;
                                    padding: 10px;
                                    border-radius: 6px;
                                  }
                                  .card-label {
                                    font-size: 12px;
                                    color: #6b7280;
                                    margin-bottom: 4px;
                                  }
                                  .card-value {
                                    font-size: 16px;
                                    font-weight: 600;
                                  }
                                  .progress-container {
                                    margin-top: 10px;
                                  }
                                  .progress-bar {
                                    width: 100%;
                                    height: 8px;
                                    background: #f3f4f6;
                                    border-radius: 4px;
                                    overflow: hidden;
                                  }
                                  .progress-fill {
                                    height: 100%;
                                    background: #0A0D50;
                                    border-radius: 4px;
                                  }
                                  .green { color: #059669; }
                                  .red { color: #dc2626; }
                                </style>
                              </head>
                              <body onload="window.print();window.close()">
                                <div class="print-container">
                                  <div class="header">
                                    <h2>Statement of Account</h2>
                                    <p>${selectedBalance.Name} • ${selectedBalance.Project}</p>
                                  </div>
                                
                                <div class="property-details">
                                  <div>
                                    <span class="badge">Block ${selectedBalance.Block}</span>
                                    <span class="badge" style="margin-left: 8px;">Lot ${selectedBalance.Lot}</span>
                                  </div>
                                  <div>${selectedBalance.Terms} Terms</div>
                                </div>

                                <div class="financial-grid">
                                  <div class="card">
                                    <div class="card-label">Total Contract Price</div>
                                    <div class="card-value">${formatCurrency(selectedBalance.TCP)}</div>
                                  </div>
                                  <div class="card">
                                    <div class="card-label">Amount Paid</div>
                                    <div class="card-value green">${formatCurrency(selectedBalance.Amount)}</div>
                                  </div>
                                </div>

                                <div class="card">
                                  <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="card-label">Remaining Balance</div>
                                    <div class="card-value red">${formatCurrency(selectedBalance["Remaining Balance"])}</div>
                                  </div>
                                  <div class="progress-container">
                                    <div class="progress-bar">
                                      <div class="progress-fill" style="width: ${selectedBalance.Amount && selectedBalance.TCP ? (selectedBalance.Amount / selectedBalance.TCP) * 100 : 0}%"></div>
                                    </div>
                                  </div>
                                </div>

                                <div class="card" style="margin-top: 20px;">
                                  <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="card-label">Payment Progress</div>
                                    <div class="card-value">${selectedBalance["MONTHS PAID"]} / ${selectedBalance.Terms} months</div>
                                  </div>
                                  <div style="font-size: 12px; color: #6b7280; margin: 4px 0 8px;">Latest Payment: ${selectedBalance["Months Paid"]}</div>
                                  <div class="progress-bar">
                                    <div class="progress-fill" style="background: #059669; width: ${selectedBalance["MONTHS PAID"] && selectedBalance.Terms ? (parseInt(selectedBalance["MONTHS PAID"]) / parseInt(selectedBalance.Terms)) * 100 : 0}%"></div>
                                  </div>
                                  </div>
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 focus:outline-none bg-blue-50 hover:bg-blue-100 rounded-lg p-1.5 transition-colors duration-150"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 rounded-lg p-1.5 transition-colors duration-150"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {/* Property Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Block {selectedBalance.Block}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Lot {selectedBalance.Lot}
                      </span>
                    </div>
                    <span className="text-gray-500">{selectedBalance.Terms} Terms</span>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-gray-500 mb-1">Total Contract Price</p>
                      <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedBalance.TCP)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-gray-500 mb-1">Amount Paid</p>
                      <p className="text-base font-semibold text-green-600">{formatCurrency(selectedBalance.Amount)}</p>
                    </div>
                  </div>

                  {/* Balance and Progress */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium text-gray-500">Remaining Balance</p>
                      <p className="text-base font-semibold text-red-600">{formatCurrency(selectedBalance["Remaining Balance"])}</p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0A0D50] rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedBalance.Amount && selectedBalance.TCP ? 
                            (selectedBalance.Amount / selectedBalance.TCP) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-medium text-gray-500">Payment Progress</p>
                      <p className="text-xs font-medium text-gray-900">
                        {selectedBalance["MONTHS PAID"]} / {selectedBalance.Terms} months
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Latest Payment: {selectedBalance["Months Paid"]}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedBalance["MONTHS PAID"] && selectedBalance.Terms ? 
                            (parseInt(selectedBalance["MONTHS PAID"]) / parseInt(selectedBalance.Terms)) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedBalance && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Balance Record</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the balance record for <span className="font-medium text-gray-900">{selectedBalance.Name}</span>?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedBalance)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedBalance(null);
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
    </PageTransition>
  );
};

export default BalancePage;
