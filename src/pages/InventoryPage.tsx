import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HomeIcon, HomeModernIcon, ArrowPathIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface LivingWaterProperty {
  id: number;
  Block: string;
  Lot: string;
  "Due Date 15/30": string;
  "First Due Month": string;
  Amount: number;
  Realty: string;
  "Sales Director": string;
  Owner: string;
  "Date of Reservation": string;
  "Seller Name": string;
  "Broker / Realty": string;
  Reservation: number;
  "Lot Area": number;
  "Price per sqm": number;
  TCP: number;
  TSP: number;
  "MISC FEE": number;
  "Net Contract Price": number;
  "First MA": number;
  "1st MA net of Advance Payment": number;
  "2ndto60th MA": number;
  Term: string;
  "Optional: Advance Payment"?: number;
  Year: number;
  Status?: string;
  created_at?: string;
}

interface HavahillsProperty {
  id: number;
  Block: string | number;
  Lot: string | number;
  Due: string;
  "Date of Reservation": string;
  "First Due": string;
  Terms: string;
  Amount: number;
  Realty: string;
  "Buyers Name": string;
  "Seller Name": string;
  "Sales Director": string;
  Broker: string;
  "Lot Size": number;
  Price: number;
  "Payment Scheme": string;
  "Vat Status": string;
  TSP: number;
  "Mode of Payment": string;
  Reservation: number;
  "Comm Price": number;
  "Misc Fee": number;
  Vat: number;
  TCP: number;
  "1ST MA": number;
  "1ST MA with Holding Fee": number;
  "2ND TO 48TH MA": number;
  "NEW TERM": string;
  "PASALO PRICE": number;
  "NEW MA": number;
  Status?: string;
}

type Property = LivingWaterProperty | HavahillsProperty;

// Function to check if property is Living Water
const isLivingWaterProperty = (property: Property): property is LivingWaterProperty => {
  return 'Owner' in property;
};

const projects = [
  { 
    id: 'LivingWater', 
    name: 'Living Water Subdivision', 
    icon: (className: string) => <HomeIcon className={className} />
  },
  { 
    id: 'Havahills', 
    name: 'Havahills Estate', 
    icon: (className: string) => <HomeModernIcon className={className} />
  }
];

const statusOptions = [
  { id: 'all', name: 'All Statuses' },
  { id: 'available', name: 'Available' },
  { id: 'sold', name: 'Sold' }
];

const InventoryPage: React.FC = () => {

  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [propertyToReopen, setPropertyToReopen] = useState<Property | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [propertyToSell, setPropertyToSell] = useState<Property | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  useEffect(() => {
    fetchProperties();
  }, [selectedProject]);

  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, remove commas and convert to float
    if (typeof value === 'string') {
      // Remove commas and any other non-numeric characters except decimal point
      const cleanedValue = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleanedValue) || 0;
    }
    
    return 0;
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const tableName = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';
      console.log('Fetching from table:', tableName);

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('Block', { ascending: true })
        .order('Lot', { ascending: true });

      if (error) {
        throw error;
      }

      // Log the raw data received
      console.log(`Received ${data?.length || 0} records:`, data);

      // Log the first record in detail to debug
      if (data && data.length > 0) {
        const firstItem = data[0];
        console.log('First record details:');
        console.log('- TCP:', firstItem.TCP, 'Type:', typeof firstItem.TCP);
        console.log('- TSP:', firstItem.TSP, 'Type:', typeof firstItem.TSP);
        console.log('- Net Contract Price:', firstItem['Net Contract Price'], 'Type:', typeof firstItem['Net Contract Price']);
        
        // Test parsing with our function
        console.log('Parsed TCP:', parseNumericValue(firstItem.TCP));
        console.log('Formatted TCP:', formatCurrency(parseNumericValue(firstItem.TCP)));
      }

      // Transform numeric strings to numbers based on property type
      const transformedData = transformData(data);

      setProperties(transformedData);
    } catch (error: any) {
      console.error('Error fetching properties:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-PH');
    } catch (error) {
      return dateString;
    }
  };

  const formatNumber = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let bgColor = 'bg-gray-100 text-gray-800'; // Default style
    
    if (statusLower === 'available') {
      bgColor = 'bg-green-100 text-green-800';
    } else if (statusLower === 'sold') {
      bgColor = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
        {status}
      </span>
    );
  };

  const filteredProperties = properties.filter((property) => {
    const searchQuery = searchTerm;
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    if (selectedProject.id === 'LivingWater') {
      const livingWaterProperty = property as LivingWaterProperty;
      return [
        livingWaterProperty.Block,
        livingWaterProperty.Lot,
        livingWaterProperty.Owner,
        livingWaterProperty["Seller Name"],
        livingWaterProperty["Broker / Realty"]
      ].some(field => field?.toString().toLowerCase().includes(searchLower));
    } else {
      const havahillsProperty = property as HavahillsProperty;
      return [
        havahillsProperty.Block,
        havahillsProperty.Lot,
        havahillsProperty['Buyers Name'],
        havahillsProperty['Seller Name'],
        havahillsProperty.Broker
      ].some(field => field?.toString().toLowerCase().includes(searchLower));
    }
  }).filter((property) => {
    if (statusFilter === 'all') return true;
    
    // Case-insensitive comparison for status
    const propertyStatus = property.Status?.toLowerCase() || '';
    const filterStatus = statusFilter.toLowerCase();
    return propertyStatus === filterStatus;
  });

  // Debug logging for status filtering
  useEffect(() => {
    if (statusFilter !== 'all') {
      console.log('Status filter:', statusFilter);
      console.log('Properties with matching status:', properties.filter(p => 
        (p.Status?.toLowerCase() || '') === statusFilter.toLowerCase()
      ).length);
      
      // Log the first few properties and their status values
      console.log('Sample property status values:', 
        properties.slice(0, 5).map(p => p.Status || 'undefined')
      );
    }
  }, [statusFilter, properties]);

  console.log('Filtered properties length:', filteredProperties.length);

  const renderLivingWaterTable = (data: LivingWaterProperty[]) => (
    <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-16rem)]">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-[#0A0D50] z-30">
            <tr>
              <th className="sticky left-0 bg-[#0A0D50] z-20 px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="sticky left-[80px] bg-[#0A0D50] z-20 px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Due Date 15/30</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">First Due Month</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Seller Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Broker / Realty</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Reservation</th>
<th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Optional: Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Lot Area</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Price per sqm</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">TCP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">TSP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">MISC FEE</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Net Contract Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Monthly Amortization</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">1st MA net of Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">2ndto60th MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white z-10 px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="sticky left-[80px] bg-white z-10 px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Owner}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Due Date 15/30"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["First Due Month"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(property["Date of Reservation"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Seller Name"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Broker / Realty"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Reservation)}</td>
{isLivingWaterProperty(property) && (
  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Optional: Advance Payment"] ?? null)}</td>
) }
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatNumber(property["Lot Area"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Price per sqm"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["MISC FEE"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Net Contract Price"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["First MA"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["1st MA net of Advance Payment"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["2ndto60th MA"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {renderStatusBadge(property.Status)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {property.Status?.toLowerCase() === 'sold' && (
                      <button
                        onClick={() => handleReopenProperty(property)}
                        className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                        title="Reopen Property"
                      >
                        <span className="flex items-center space-x-1">
                          <ArrowPathIcon className="h-4 w-4" />
                          <span>Reopen</span>
                        </span>
                      </button>
                    )}
                    {property.Status?.toLowerCase() === 'available' && (
                      <button
                        onClick={() => handleSellProperty(property)}
                        className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200"
                        title="Sell Property"
                      >
                        <span className="flex items-center space-x-1">
                          <ShoppingCartIcon className="h-4 w-4" />
                          <span>Sell</span>
                        </span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHavahillsTable = (data: HavahillsProperty[]) => (
    <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-16rem)]">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-[#0A0D50] z-30">
            <tr>
              <th className="sticky left-0 bg-[#0A0D50] z-20 px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="sticky left-[80px] bg-[#0A0D50] z-20 px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Buyers Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Date of Reservation</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">First Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Terms</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Seller Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Sales Director</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">Broker</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Lot Size</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Price</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Payment Scheme</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Vat Status</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">TSP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Mode of Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Reservation</th>
<th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Optional: Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Comm Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Misc Fee</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Vat</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">TCP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">1st MA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">1ST MA with Holding Fee</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">2ND TO 48TH MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">NEW TERM</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">PASALO PRICE</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">NEW MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white z-10 px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="sticky left-[80px] bg-white z-10 px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Buyers Name']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Due}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(property['Date of Reservation'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['First Due']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Terms}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Seller Name']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Sales Director']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Broker}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatNumber(property['Lot Size'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Price)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Payment Scheme']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Vat Status']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Mode of Payment']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Reservation)}</td>
{isLivingWaterProperty(property) && (
  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Optional: Advance Payment"] ?? null)}</td>
) }
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['Comm Price'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['Misc Fee'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Vat)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['1ST MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['1ST MA with Holding Fee'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['2ND TO 48TH MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['NEW TERM']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['PASALO PRICE'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['NEW MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {renderStatusBadge(property.Status)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {property.Status?.toLowerCase() === 'sold' && (
                      <button
                        onClick={() => handleReopenProperty(property)}
                        className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                        title="Reopen Property"
                      >
                        <span className="flex items-center space-x-1">
                          <ArrowPathIcon className="h-4 w-4" />
                          <span>Reopen</span>
                        </span>
                      </button>
                    )}
                    {property.Status?.toLowerCase() === 'available' && (
                      <button
                        onClick={() => handleSellProperty(property)}
                        className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200"
                        title="Sell Property"
                      >
                        <span className="flex items-center space-x-1">
                          <ShoppingCartIcon className="h-4 w-4" />
                          <span>Sell</span>
                        </span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const scrollTable = (direction: 'left' | 'right') => {
    const tableContainers = document.querySelectorAll('.inventory-table-container');
    if (tableContainers.length === 0) return;
    
    const tableContainer = tableContainers[0] as HTMLElement;
    const scrollAmount = 300; // Scroll by 300px
    
    if (direction === 'left') {
      tableContainer.scrollLeft -= scrollAmount;
    } else {
      tableContainer.scrollLeft += scrollAmount;
    }
  };

  useEffect(() => {
    const checkTableWidth = () => {
      const tableContainers = document.querySelectorAll('.inventory-table-container');
      if (tableContainers.length === 0) return;
      
      const tableContainer = tableContainers[0] as HTMLElement;
      const needsScrolling = tableContainer.scrollWidth > tableContainer.clientWidth;
      setShowScrollButtons(needsScrolling);
    };
    
    // Check after the table is rendered
    setTimeout(checkTableWidth, 500);
    
    // Also check on window resize
    window.addEventListener('resize', checkTableWidth);
    
    return () => {
      window.removeEventListener('resize', checkTableWidth);
    };
  }, [properties, selectedProject]);

  useEffect(() => {
    // Add a style tag to hide the bottom scrollbar but keep the functionality
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-custom-styles', 'true');
    styleElement.textContent = `
      .overflow-auto::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .overflow-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;
      }
      .overflow-auto::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 5px;
        border: 2px solid #f1f1f1;
      }
      .overflow-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .inventory-table-container {
        overflow-x: scroll !important;
        scrollbar-width: auto;
      }
      
      .inventory-table-container::-webkit-scrollbar {
        height: 10px;
        display: block;
      }
      
      .inventory-table-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;
      }
      
      .inventory-table-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 5px;
      }
      
      .inventory-table-container::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Remove any existing scrollbars first
    const existingScrollbars = document.querySelectorAll('.top-scrollbar-container');
    existingScrollbars.forEach(scrollbar => {
      if (scrollbar.parentNode) {
        scrollbar.parentNode.removeChild(scrollbar);
      }
    });
    
    // Function to create and sync the top scrollbar
    const createTopScrollbar = () => {
      const tableContainers = document.querySelectorAll('.inventory-table-container');
      if (tableContainers.length === 0) return null;
      
      const tableContainer = tableContainers[0] as HTMLElement;
      
      // Create a scrollbar container
      const scrollbarContainer = document.createElement('div');
      scrollbarContainer.className = 'top-scrollbar-container';
      scrollbarContainer.style.position = 'sticky';
      scrollbarContainer.style.top = '0';
      scrollbarContainer.style.zIndex = '20'; // High z-index to ensure visibility
      scrollbarContainer.style.width = '100%';
      scrollbarContainer.style.height = '12px';
      scrollbarContainer.style.backgroundColor = '#f9fafb';
      scrollbarContainer.style.overflow = 'auto';
      scrollbarContainer.style.borderBottom = '1px solid #e5e7eb';
      
      // Create the scrollbar content
      const scrollbarContent = document.createElement('div');
      
      // Update the width dynamically
      const updateScrollbarWidth = () => {
        if (tableContainer.scrollWidth > 0) {
          scrollbarContent.style.width = tableContainer.scrollWidth + 'px';
        } else {
          scrollbarContent.style.width = '2000px'; // Default width
        }
      };
      
      updateScrollbarWidth();
      scrollbarContent.style.height = '1px';
      
      // Add the content to the container
      scrollbarContainer.appendChild(scrollbarContent);
      
      // Add the scrollbar to the page - insert before the table container
      if (tableContainer.parentNode) {
        tableContainer.parentNode.insertBefore(scrollbarContainer, tableContainer);
      }
      
      // Sync scrolling between the table and the scrollbar
      const syncScroll = (source: HTMLElement, target: HTMLElement) => {
        target.scrollLeft = source.scrollLeft;
      };
      
      scrollbarContainer.addEventListener('scroll', () => {
        syncScroll(scrollbarContainer, tableContainer);
      });
      
      tableContainer.addEventListener('scroll', () => {
        syncScroll(tableContainer, scrollbarContainer);
      });
      
      // Update scrollbar width when table size changes
      const resizeObserver = new ResizeObserver(() => {
        updateScrollbarWidth();
      });
      
      resizeObserver.observe(tableContainer);
      
      return { scrollbar: scrollbarContainer, observer: resizeObserver };
    };
    
    // Wait for the table to render
    const timer = setTimeout(() => {
      const result = createTopScrollbar();
      
      // Clean up function
      return () => {
        if (result) {
          const { scrollbar, observer } = result;
          if (scrollbar && scrollbar.parentNode) {
            scrollbar.parentNode.removeChild(scrollbar);
          }
          observer.disconnect();
        }
      };
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [properties, selectedProject, filteredProperties]);

  // Add debug logging for data types
  useEffect(() => {
    if (properties.length > 0) {
      const sampleProperty = properties[0];
      if (selectedProject.id === 'LivingWater') {
        const livingWaterProperty = sampleProperty as LivingWaterProperty;
        console.log('Sample Living Water property data types:', {
          Block: typeof livingWaterProperty.Block,
          Lot: typeof livingWaterProperty.Lot,
          Amount: typeof livingWaterProperty.Amount,
          "Lot Area": typeof livingWaterProperty["Lot Area"],
          TCP: typeof livingWaterProperty.TCP
        });
      } else {
        const havahillsProperty = sampleProperty as HavahillsProperty;
        console.log('Sample Havahills property data types:', {
          Block: typeof havahillsProperty.Block,
          Lot: typeof havahillsProperty.Lot,
          Amount: typeof havahillsProperty.Amount,
          'Lot Size': typeof havahillsProperty['Lot Size'],
          TCP: typeof havahillsProperty.TCP
        });
      }
    }
  }, [properties, selectedProject]);

  const transformData = (data: any[]): Property[] => {
    return data.map(item => {
      if (selectedProject.id === 'LivingWater') {
        return {
          id: item.id,
          Block: item.Block || '',
          Lot: item.Lot || '',
          "Due Date 15/30": item["Due Date 15/30"] || '',
          "First Due Month": item["First Due Month"] || '',
          Amount: parseNumericValue(item.Amount),
          Realty: item.Realty || '',
          "Sales Director": item["Sales Director"] || '',
          Owner: item.Owner || '',
          "Date of Reservation": item["Date of Reservation"] || '',
          "Seller Name": item["Seller Name"] || '',
          "Broker / Realty": item["Broker / Realty"] || '',
          Reservation: parseNumericValue(item.Reservation),
          "Lot Area": parseNumericValue(item["Lot Area"]),
          "Price per sqm": parseNumericValue(item["Price per sqm"]),
          TCP: parseNumericValue(item.TCP),
          TSP: parseNumericValue(item.TSP),
          "MISC FEE": parseNumericValue(item["MISC FEE"]),
          "Net Contract Price": parseNumericValue(item["Net Contract Price"]),
          "First MA": parseNumericValue(item["First MA"]),
          "1st MA net of Advance Payment": parseNumericValue(item["1st MA net of Advance Payment"]),
          "2ndto60th MA": parseNumericValue(item["2ndto60th MA"]),
          Year: parseNumericValue(item.Year),
          Status: item.Status || '',
          created_at: item.created_at
        } as LivingWaterProperty;
      } else {
        return {
          id: item.id,
          Block: item.Block,
          Lot: item.Lot,
          Due: item.Due || '',
          "Date of Reservation": item["Date of Reservation"] || '',
          "First Due": item["First Due"] || '',
          Terms: item.Terms || '',
          Amount: parseNumericValue(item.Amount),
          Realty: item.Realty || '',
          "Buyers Name": item["Buyers Name"] || '',
          "Seller Name": item["Seller Name"] || '',
          "Sales Director": item["Sales Director"] || '',
          Broker: item.Broker || '',
          "Lot Size": parseNumericValue(item["Lot Size"]),
          Price: parseNumericValue(item.Price),
          "Payment Scheme": item["Payment Scheme"] || '',
          "Vat Status": item["Vat Status"] || '',
          TSP: parseNumericValue(item.TSP),
          "Mode of Payment": item["Mode of Payment"] || '',
          Reservation: parseNumericValue(item.Reservation),
          "Comm Price": parseNumericValue(item["Comm Price"]),
          "Misc Fee": parseNumericValue(item["Misc Fee"]),
          Vat: parseNumericValue(item.Vat),
          TCP: parseNumericValue(item.TCP),
          "1ST MA": parseNumericValue(item["1ST MA"] || item["1st MA"]),
          "1ST MA with Holding Fee": parseNumericValue(item["1ST MA with Holding Fee"]),
          "2ND TO 48TH MA": parseNumericValue(item["2ND TO 48TH MA"]),
          "NEW TERM": item["NEW TERM"] || '',
          "PASALO PRICE": parseNumericValue(item["PASALO PRICE"]),
          "NEW MA": parseNumericValue(item["NEW MA"]),
          Status: item.Status || ''
        } as HavahillsProperty;
      }
    });
  };










  // Function to handle reopening a sold property
  const handleReopenProperty = async (property: Property) => {
    setPropertyToReopen(property);
    setIsReopenModalOpen(true);
  };

  // Function to handle selling a property
  const handleSellProperty = (property: Property) => {
    setPropertyToSell(property);
    setIsSellModalOpen(true);
  };

  // Function to handle confirming property sale
  const confirmSell = async () => {
    if (!propertyToSell) {
      console.error('No property selected for sale');
      return;
    }

    try {
      console.log('Starting property sale process for:', propertyToSell);
      console.log('Property type:', isLivingWaterProperty(propertyToSell) ? 'Living Water' : 'Havahills');
      
      const tableName = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';
      console.log('Using table name:', tableName);
      
      // Create a clean update data object based on property type
      let updateData: any = {};
      
      // Set the status to Sold for both property types
      updateData.Status = 'Sold';
      
      // Handle Living Water properties
      if (isLivingWaterProperty(propertyToSell)) {
        console.log('Processing Living Water property');
        const lwProperty = propertyToSell as LivingWaterProperty;
        
        // Log all field values for debugging
        console.log('Living Water Property fields:');
        console.log('Owner:', lwProperty.Owner);
        console.log('Due Date 15/30:', lwProperty["Due Date 15/30"]);
        console.log('First Due Month:', lwProperty["First Due Month"]);
        console.log('Amount:', lwProperty.Amount);
        console.log('Realty:', lwProperty.Realty);
        // Sales Director column removed from updateData and logs
        console.log('Seller Name:', lwProperty["Seller Name"]);
        console.log('Broker / Realty:', lwProperty["Broker / Realty"]);
        console.log('Reservation:', lwProperty.Reservation);
        console.log('Lot Area:', lwProperty["Lot Area"]);
        console.log('Price per sqm:', lwProperty["Price per sqm"]);
        console.log('TCP:', lwProperty.TCP);
        console.log('TSP:', lwProperty.TSP);
        console.log('MISC FEE:', lwProperty["MISC FEE"]);
        console.log('Net Contract Price:', lwProperty["Net Contract Price"]);
        console.log('Monthly Amortization:', lwProperty["First MA"]);
        console.log('1st MA net of Advance Payment:', lwProperty["1st MA net of Advance Payment"]);
        console.log('2ndto60th MA:', lwProperty["2ndto60th MA"]);
        
        // Ensure all fields are included in the update data
        updateData = {
  Block: lwProperty.Block,
  Lot: lwProperty.Lot,
  "Price per sqm": lwProperty["Price per sqm"] || 0,
  TCP: lwProperty.TCP || 0,
  Status: 'Sold',
  "First MA": lwProperty["First MA"] || 0,
  Owner: lwProperty.Owner || '',
  Term: lwProperty.Term || '',
  "Lot Area": lwProperty["Lot Area"] || 0,
  TSP: lwProperty.TSP || 0,
  "MISC FEE": lwProperty["MISC FEE"] || 0,
  "2ndto60th MA": lwProperty["2ndto60th MA"] || 0,
  "First Due Month": lwProperty["First Due Month"] || '',
  "Date of Reservation": lwProperty["Date of Reservation"] || new Date().toISOString().split('T')[0],
  "Seller Name": lwProperty["Seller Name"] || '',
  "Broker / Realty": lwProperty["Broker / Realty"] || '',
  Reservation: lwProperty.Reservation || 0,
  "Due Date 15/30": lwProperty["Due Date 15/30"] || '',
  Amount: lwProperty.Amount || 0,
  "Net Contract Price": lwProperty["Net Contract Price"] || 0,
  Realty: lwProperty.Realty || '',
  "Optional: Advance Payment": lwProperty["Optional: Advance Payment"] || 0,
  "1st MA net of Advance Payment": lwProperty["1st MA net of Advance Payment"] || 0
};
      } 
      // Handle Havahills properties
      else {
        console.log('Processing Havahills property');
        const hhProperty = propertyToSell as HavahillsProperty;
        console.log('Property ID:', hhProperty.id);
        console.log('Block:', hhProperty.Block);
        console.log('Lot:', hhProperty.Lot);
        console.log('Buyers Name:', hhProperty["Buyers Name"]);
        
        // Ensure all fields are included in the update data
        updateData = {
          Block: hhProperty.Block,
          Lot: hhProperty.Lot,
          Due: hhProperty.Due || '',
          "Date of Reservation": hhProperty["Date of Reservation"] || new Date().toISOString().split('T')[0],
          "First Due": hhProperty["First Due"] || '',
          Terms: hhProperty.Terms || '',
          Amount: hhProperty.Amount || 0,
          Realty: hhProperty.Realty || '',
          "Buyers Name": hhProperty["Buyers Name"] || '',
          "Seller Name": hhProperty["Seller Name"] || '',
          "Sales Director": hhProperty["Sales Director"] || '',
          Broker: hhProperty.Broker || '',
          "Lot Size": hhProperty["Lot Size"] || 0,
          Price: hhProperty.Price || 0,
          "Payment Scheme": hhProperty["Payment Scheme"] || '',
          "Vat Status": hhProperty["Vat Status"] || '',
          TSP: hhProperty.TSP || 0,
          "Mode of Payment": hhProperty["Mode of Payment"] || '',
          Reservation: hhProperty.Reservation || 0,
          "Comm Price": hhProperty["Comm Price"] || 0,
          "Misc Fee": hhProperty["Misc Fee"] || 0,
          Vat: hhProperty.Vat || 0,
          TCP: hhProperty.TCP || 0,
          "1ST MA": hhProperty["1ST MA"] || 0,
          "1ST MA with Holding Fee": hhProperty["1ST MA with Holding Fee"] || 0,
          "2ND TO 48TH MA": hhProperty["2ND TO 48TH MA"] || 0,
          "NEW TERM": hhProperty["NEW TERM"] || '',
          "PASALO PRICE": hhProperty["PASALO PRICE"] || 0,
          "NEW MA": hhProperty["NEW MA"] || 0,
          Status: 'Sold'
        };
      }

      // Log the update data for debugging
      console.log('Saving property with data:', updateData);

      // Update the property in the database
      console.log(`Updating ${tableName} where id = ${propertyToSell.id}`);
      const { data, error: propertyError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', propertyToSell.id)
        .select();

      console.log('Update response:', data);
      
      if (propertyError) {
        console.error('Error updating property:', propertyError);
        throw propertyError;
      }

      // Get the client name based on property type
      const clientName = isLivingWaterProperty(propertyToSell) ? propertyToSell.Owner : propertyToSell["Buyers Name"];
      
      if (clientName) {
        // Check if client already exists in Clients table
        const { data: existingClients, error: checkError } = await supabase
          .from('Clients')
          .select('id')
          .eq('Name', clientName);

        if (checkError) {
          console.error('Error checking for existing client:', checkError);
        }

        if (!existingClients || existingClients.length === 0) {
          // Only insert if client does not exist
          const clientData = { Name: clientName };
          const { error: clientError } = await supabase
            .from('Clients')
            .insert(clientData);
          if (clientError) {
            console.error('Error saving client:', clientError);
          }
        } else {
          console.log('Client already exists, skipping insert:', clientName);
        }
        
        // Find the matching entry in Balance table based on Project, Block and Lot
        const project = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';
        const block = propertyToSell.Block;
        const lot = propertyToSell.Lot;
        
        // First, check if there's an existing entry for this property
        const { data: existingBalance } = await supabase
          .from('Balance')
          .select('*')
          .eq('Project', project)
          .eq('Block', block)
          .eq('Lot', lot)
          .single();
        
        if (existingBalance) {
          // Update the existing entry with the new name
          const { error: balanceUpdateError } = await supabase
            .from('Balance')
            .update({ 
              Name: clientName,
              'Remaining Balance': isLivingWaterProperty(propertyToSell) ? 
                propertyToSell["Net Contract Price"] : 
                propertyToSell.TCP,
              'Amount': isLivingWaterProperty(propertyToSell) ? 
                propertyToSell["First MA"] : 
                propertyToSell["1ST MA"],
              'Months Paid': '0',
              'MONTHS PAID': 0
            })
            .eq('Project', project)
            .eq('Block', block)
            .eq('Lot', lot);

          if (balanceUpdateError) {
            console.error('Error updating balance:', balanceUpdateError);
          }
        } else {
          // Create a new entry in the Balance table
          const balanceData = {
            Name: clientName,
            'Remaining Balance': isLivingWaterProperty(propertyToSell) ? 
              propertyToSell["Net Contract Price"] : 
              propertyToSell.TCP,
            'Amount': isLivingWaterProperty(propertyToSell) ? 
              propertyToSell["First MA"] : 
              propertyToSell["1ST MA"],
            'Months Paid': '0',
            'MONTHS PAID': 0,
            'Project': project,
            'Block': block,
            'Lot': lot
          };
          
          const { error: balanceError } = await supabase
            .from('Balance')
            .insert(balanceData);

          if (balanceError) {
            console.error('Error saving balance:', balanceError);
          }
        }
      }

      // Update local state
      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyToSell.id ? { ...prop, ...updateData } : prop
        )
      );

      setIsSellModalOpen(false);
      setPropertyToSell(null);
    } catch (error: any) {
      console.error('Error selling property:', error.message);
    }
  };

  const confirmReopen = async () => {
    if (!propertyToReopen) return;

    try {
      const tableName = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';

      // Get the client name based on property type
      const clientName = isLivingWaterProperty(propertyToReopen) ? propertyToReopen.Owner : propertyToReopen["Buyers Name"];

      if (!clientName) {
        console.error('No client name found for property');
        return;
      }

      // Delete from Clients table
      const { error: clientError } = await supabase
        .from('Clients')
        .delete()
        .eq('Name', clientName);

      if (clientError) {
        console.error('Error deleting client:', clientError);
      }

      // Delete from Documents table
      const { error: documentsError } = await supabase
        .from('Documents')
        .delete()
        .eq('Name', clientName);

      if (documentsError) {
        console.error('Error deleting documents:', documentsError);
      }

      // Update Balance table to clear specific fields
      const { error: balanceError } = await supabase
        .from('Balance')
        .update({
          'Name': '',
          'Remaining Balance': null,
          'Amount': null,
          'Months Paid': '',
          'MONTHS PAID': null
        })
        .eq('Name', clientName);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
      }

      // Create an update object with cleared fields and Available status
      const updateData: any = {
        Status: 'Available'
      };

      // Clear specific fields based on property type
      if (isLivingWaterProperty(propertyToReopen)) {
        // Living Water property fields
        updateData['Owner'] = '';
        updateData['Due Date 15/30'] = '';
        updateData['First Due Month'] = '';
        updateData['Realty'] = '';
        updateData['Date of Reservation'] = '';
        updateData['Seller Name'] = '';
        updateData['Broker / Realty'] = '';
      } else {
        // Havahills property fields
        updateData['Buyers Name'] = '';
        updateData['Due'] = '';
        updateData['First Due'] = '';
        updateData['Realty'] = '';
        updateData['Date of Reservation'] = '';
        updateData['Seller Name'] = '';
        updateData['Broker'] = '';
        updateData['Sales Director'] = '';
        updateData['Mode of Payment'] = '';
      }
      // Only add Sales Director for Havahills
      if (!isLivingWaterProperty(propertyToReopen)) {
        updateData['Sales Director'] = '';
      }
      // Only add Seller Name for Living Water
      if (isLivingWaterProperty(propertyToReopen)) {
        updateData['Seller Name'] = '';
      }

      // Update the property in the database
      const { error: propertyError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', propertyToReopen.id);

      if (propertyError) throw propertyError;

      // Update local state
      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyToReopen.id ? { ...prop, ...updateData } : prop
        )
      );

      setIsReopenModalOpen(false);
      setPropertyToReopen(null);
    } catch (error: any) {
      console.error('Error reopening property:', error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Sell Modal */}
      <Transition appear show={isSellModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsSellModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  <div className={`bg-gradient-to-r ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'from-[#0A0D50] to-[#1E3A8A]' : 'from-green-800 to-green-600'} px-6 py-5 flex items-center justify-between`}>
                    <Dialog.Title as="h3" className="text-xl font-semibold text-white flex items-center gap-2">
                      <ShoppingCartIcon className="h-6 w-6" />
                      Sell {propertyToSell && isLivingWaterProperty(propertyToSell) ? 'Living Water' : 'Havahills'} Property
                    </Dialog.Title>
                    <button
                      onClick={() => setIsSellModalOpen(false)}
                      className="text-gray-300 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="max-h-[80vh] overflow-y-auto">
                    {propertyToSell && (
                      <>
                        {/* Property Summary Banner */}
                        <div className={`bg-gradient-to-r ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'from-blue-50 to-blue-100 border-l-4 border-blue-500' : 'from-green-50 to-green-100 border-l-4 border-green-500'} p-5 mb-6`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`text-lg font-semibold ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'text-blue-800' : 'text-green-800'} mb-2 flex items-center`}>
                                <HomeIcon className="h-5 w-5 mr-2" />
                                Property {propertyToSell.Block}-{propertyToSell.Lot}
                              </h4>
                              <div className={`text-sm ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'text-blue-800' : 'text-green-800'}`}>
                                {selectedProject.name}
                              </div>
                            </div>
                            <div className={`bg-gradient-to-r ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'from-blue-500 to-indigo-500 border border-blue-300' : 'from-green-500 to-green-600 border border-green-300'} px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1`}>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              <span className="text-sm font-medium text-white tracking-wide">
                                {propertyToSell.Status || 'Available'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
                            
                            {isLivingWaterProperty(propertyToSell) && (
                              <>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md border border-blue-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                  <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    Lot Area
                                  </div>
                                  <div className="font-bold text-gray-800 text-xl flex items-baseline">
                                    <span>{propertyToSell["Lot Area"]}</span>
                                    <span className="ml-1 text-sm text-gray-600">sqm</span>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md border border-blue-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                  <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                    Price
                                  </div>
                                  <div className="font-bold text-gray-800 text-xl">₱{formatNumber(propertyToSell.TCP || 0)}</div>
                                </div>
                              </>
                            )}
                            
                            {!isLivingWaterProperty(propertyToSell) && (
                              <>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md border border-blue-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                  <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    Lot Size
                                  </div>
                                  <div className="font-bold text-gray-800 text-xl flex items-baseline">
                                    <span>{propertyToSell["Lot Size"]}</span>
                                    <span className="ml-1 text-sm text-gray-600">sqm</span>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md border border-blue-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                  <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                    Price
                                  </div>
                                  <div className="font-bold text-gray-800 text-xl">₱{formatNumber(propertyToSell.Price || 0)}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Main Content Area */}
                        <div className="px-6">
                          {/* Payment Details Section */}
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                              Payment Details
                            </h4>
                            <div className="bg-white p-5 rounded-xl shadow-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {/* Living Water specific fields */}
                              {isLivingWaterProperty(propertyToSell) && (
                        <>


                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Owner</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Owner || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, Owner: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Due Date</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <select
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white appearance-none"
                                value={propertyToSell["Due Date 15/30"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "Due Date 15/30": e.target.value } : null)}
                              >
                                <option value="">Select Due Date</option>
                                <option value="15th">15th</option>
                                <option value="30th">30th</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">First Due Month</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["First Due Month"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "First Due Month": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Amount</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Amount || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, Amount: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Broker / Realty</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Broker / Realty"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "Broker / Realty": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Reservation</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Reservation || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, Reservation: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Lot Area</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Lot Area"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "Lot Area": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Price per sqm</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 4a1 1 0 000 2 1 1 0 011 1v1H7a1 1 0 000 2h1v3a3 3 0 106 0v-1a1 1 0 10-2 0v1a1 1 0 11-2 0v-3h3a1 1 0 100-2h-3V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Price per sqm"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "Price per sqm": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">TCP</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.TCP || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, TCP: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">TSP</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.TSP || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, TSP: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">MISC FEE</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["MISC FEE"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "MISC FEE": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Net Contract Price</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Net Contract Price"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "Net Contract Price": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">First MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["First MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "First MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">1st MA net of Advance Payment</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["1st MA net of Advance Payment"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "1st MA net of Advance Payment": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">2ndto60th MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["2ndto60th MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as LivingWaterProperty, "2ndto60th MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Havahills specific fields */}
                      {!isLivingWaterProperty(propertyToSell) && (
                        <>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Buyer's Name</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Buyers Name"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Buyers Name": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Due</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <select
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white appearance-none"
                                value={propertyToSell.Due || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Due: e.target.value } : null)}
                              >
                                <option value="">Select Due Date</option>
                                <option value="15th">15th</option>
                                <option value="30th">30th</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Date of Reservation</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="date"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Date of Reservation"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Date of Reservation": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Terms</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Terms"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Terms": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Amount</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Amount || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Amount: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Realty</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Realty || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Realty: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Seller Name</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Seller Name"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Seller Name": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Sales Director</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Sales Director"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Sales Director": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Broker</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Broker || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Broker: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Lot Size</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Lot Size"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Lot Size": parseFloat(e.target.value) || 0 } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Mode of Payment</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Mode of Payment"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Mode of Payment": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Price</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Price || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Price: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Payment Scheme</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Payment Scheme"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Payment Scheme": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Vat Status</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Vat Status"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Vat Status": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">TSP</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.TSP || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, TSP: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">TCP</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.TCP || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, TCP: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Reservation</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Reservation || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Reservation: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Comm Price</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Comm Price"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Comm Price": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Misc Fee</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["Misc Fee"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "Misc Fee": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">Vat</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell.Vat || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, Vat: parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">1st MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["1ST MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "1ST MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">1ST MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["1ST MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "1ST MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">1ST MA with Holding Fee</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["1ST MA with Holding Fee"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "1ST MA with Holding Fee": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">2ND TO 48TH MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["2ND TO 48TH MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "2ND TO 48TH MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">NEW TERM</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["NEW TERM"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "NEW TERM": e.target.value } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">PASALO PRICE</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["PASALO PRICE"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "PASALO PRICE": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-green-800 z-10">NEW MA</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                className="block w-full rounded-lg border-2 border-green-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-green-600 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                                value={propertyToSell["NEW MA"] || ''}
                                onChange={(e) => setPropertyToSell(prev => prev ? { ...prev as HavahillsProperty, "NEW MA": parseFloat(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Common fields */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Realty</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                            value={propertyToSell.Realty || ''}
                            onChange={(e) => setPropertyToSell(prev => prev ? { ...prev, Realty: e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Seller Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                            value={propertyToSell["Seller Name"] || ''}
                            onChange={(e) => setPropertyToSell(prev => prev ? { ...prev, "Seller Name": e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 z-10">Sales Director</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            className="block w-full rounded-lg border-2 border-gray-200 pt-3 pb-2 pl-10 pr-4 text-gray-900 focus:border-gray-500 focus:ring-0 sm:text-sm transition-all duration-200 bg-white/50 hover:bg-white"
                            value={propertyToSell["Sales Director"] || ''}
                            onChange={(e) => setPropertyToSell(prev => prev ? { ...prev, "Sales Director": e.target.value } : null)}
                          />
                        </div>
                      </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="px-6 py-5 bg-gray-50 flex justify-end space-x-4 border-t">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors duration-200 shadow-sm"
                      onClick={() => setIsSellModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center items-center rounded-lg border border-transparent ${propertyToSell && isLivingWaterProperty(propertyToSell) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus-visible:ring-blue-500' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500'} px-6 py-3 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 space-x-2`}
                      onClick={confirmSell}
                    >
                      <span className="relative">
                        <span className="absolute -inset-1 rounded-full animate-ping opacity-75 bg-white/30"></span>
                        <ShoppingCartIcon className="h-5 w-5 relative" />
                      </span>
                      <span>Complete Sale</span>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reopen Modal */}
      <Transition appear show={isReopenModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsReopenModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Reopen Property
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to reopen this property? This will delete all associated client data and set the property status back to Available.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={confirmReopen}
                    >
                      Reopen
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsReopenModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all properties in the system.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        {/* Left side - Search */}
        <div className="w-full sm:w-64">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-200 hover:ring-gray-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right side - Filters */}
        <div className="flex flex-row gap-3 w-full sm:w-auto">
          {/* Project Selector */}
          <div className="w-48">
            <div className="relative">
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || projects[0])}
                className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-200 hover:ring-gray-400 transition-all appearance-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-200 hover:ring-gray-400 transition-all appearance-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${selectedProject.id === 'LivingWater' ? 'border-blue-500' : 'border-green-500'}`}></div>
        </div>
      ) : (
        <div className="relative mt-4">
          {showScrollButtons && (
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-lg p-2 shadow-md"
              onClick={() => scrollTable('left')}
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {selectedProject.id === 'LivingWater' ? (
            renderLivingWaterTable(filteredProperties as LivingWaterProperty[])
          ) : (
            renderHavahillsTable(filteredProperties as HavahillsProperty[])
          )}

          {showScrollButtons && (
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-lg p-2 shadow-md"
              onClick={() => scrollTable('right')}
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>

      
  );
};

export default InventoryPage;