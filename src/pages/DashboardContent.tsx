import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../lib/supabaseClient';
import { Popover, Transition } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define interfaces for property types
interface LivingWaterProperty {
  id: number;
  Block: string;
  Lot: string;
  "Lot Area": number;
  Status?: string;
  [key: string]: any; // Allow other properties
}

interface HavahillsProperty {
  id: number;
  Block: string | number;
  Lot: string | number;
  "Lot Size": number;
  Status?: string;
  [key: string]: any; // Allow other properties
}

const DashboardContent: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [availableLots, setAvailableLots] = useState<number>(0);
  const [soldLots, setSoldLots] = useState<number>(0);
  const [totalLots, setTotalLots] = useState<number>(0);
  const [activeAccounts, setActiveAccounts] = useState<number>(0);
  const [livingWaterStats, setLivingWaterStats] = useState<{ available: number, sold: number, total: number }>({ available: 0, sold: 0, total: 0 });
  const [havahillsStats, setHavahillsStats] = useState<{ available: number, sold: number, total: number }>({ available: 0, sold: 0, total: 0 });
  const [livingWaterAvailableLots, setLivingWaterAvailableLots] = useState<LivingWaterProperty[]>([]);
  const [havahillsAvailableLots, setHavahillsAvailableLots] = useState<HavahillsProperty[]>([]);

  useEffect(() => {
    fetchLotData();
    fetchActiveAccounts();
  }, []);

  const fetchLotData = async () => {
    try {
      // Fetch Living Water Subdivision lots
      const { data: livingWaterLots, error: livingWaterError } = await supabase
        .from('Living Water Subdivision')
        .select('*');

      // Fetch Havahills Estate lots
      const { data: havahillsLots, error: havahillsError } = await supabase
        .from('Havahills Estate')
        .select('*');

      if (livingWaterError) {
        console.error('Living Water Error:', livingWaterError.message);
        // Continue with empty data instead of throwing
        setLivingWaterStats({ available: 0, sold: 0, total: 0 });
        setLivingWaterAvailableLots([]);
      } else {
        // Living Water Stats
        const lwAvailable = livingWaterLots?.filter((lot: any) => 
          lot.Status?.toLowerCase() === 'available'
        ).length || 0;
        const lwSold = livingWaterLots?.filter((lot: any) => 
          lot.Status?.toLowerCase() === 'sold'
        ).length || 0;
        const lwTotal = livingWaterLots?.length || 0;
        
        setLivingWaterStats({ available: lwAvailable, sold: lwSold, total: lwTotal });
        
        // Properly cast and transform the data for Living Water properties
        const typedLivingWaterLots = (livingWaterLots || [])?.filter((lot: any) => 
          lot?.Status?.toLowerCase() === 'available'
        ).map((lot: any) => ({
          id: lot.id || Math.random().toString(36).substr(2, 9),
          Block: lot.Block || '',
          Lot: lot.Lot || '',
          "Lot Area": lot["Lot Area"] || null,
          Status: lot.Status || '',
          TCP: lot.TCP || null,
          "Price per sqm": lot["Price per sqm"] || null,
          "Monthly Amortization": lot["Monthly Amortization"] || null,
          ...lot
        })) as LivingWaterProperty[];
        
        setLivingWaterAvailableLots(typedLivingWaterLots);
      }
      
      if (havahillsError) {
        console.error('Havahills Error:', havahillsError.message);
        // Continue with empty data instead of throwing
        setHavahillsStats({ available: 0, sold: 0, total: 0 });
        setHavahillsAvailableLots([]);
      } else {
        // Havahills Stats
        const hhAvailable = havahillsLots?.filter((lot: any) => 
          lot.Status?.toLowerCase() === 'available'
        ).length || 0;
        const hhSold = havahillsLots?.filter((lot: any) => 
          lot.Status?.toLowerCase() === 'sold'
        ).length || 0;
        const hhTotal = havahillsLots?.length || 0;
        
        setHavahillsStats({ available: hhAvailable, sold: hhSold, total: hhTotal });
        
        // Properly cast and transform the data for Havahills properties
        const typedHavahillsLots = (havahillsLots || [])?.filter((lot: any) => 
          lot?.Status?.toLowerCase() === 'available'
        ).map((lot: any) => ({
          id: lot.id || Math.random().toString(36).substr(2, 9),
          Block: lot.Block || '',
          Lot: lot.Lot || '',
          "Lot Size": lot["Lot Size"] || null,
          Status: lot.Status || '',
          TCP: lot.TCP || null,
          Price: lot.Price || null,
          "1st MA": lot["1st MA"] || null,
          ...lot
        })) as HavahillsProperty[];
        
        setHavahillsAvailableLots(typedHavahillsLots);
      }
      
      // Set total counts
      const totalAvailable = 
        (livingWaterError ? 0 : (livingWaterLots?.filter((lot: any) => lot.Status?.toLowerCase() === 'available').length || 0)) + 
        (havahillsError ? 0 : (havahillsLots?.filter((lot: any) => lot.Status?.toLowerCase() === 'available').length || 0));
      
      const totalSold = 
        (livingWaterError ? 0 : (livingWaterLots?.filter((lot: any) => lot.Status?.toLowerCase() === 'sold').length || 0)) + 
        (havahillsError ? 0 : (havahillsLots?.filter((lot: any) => lot.Status?.toLowerCase() === 'sold').length || 0));
      
      const totalLots = 
        (livingWaterError ? 0 : (livingWaterLots?.length || 0)) + 
        (havahillsError ? 0 : (havahillsLots?.length || 0));
      
      setAvailableLots(totalAvailable);
      setSoldLots(totalSold);
      setTotalLots(totalLots);
      
    } catch (error: any) {
      console.error('Error fetching lot data:', error?.message || 'Unknown error');
      // Set default values in case of error
      setLivingWaterStats({ available: 0, sold: 0, total: 0 });
      setHavahillsStats({ available: 0, sold: 0, total: 0 });
      setAvailableLots(0);
      setSoldLots(0);
      setTotalLots(0);
      setLivingWaterAvailableLots([]);
      setHavahillsAvailableLots([]);
    }
  };

  const fetchActiveAccounts = async () => {
    try {
      const { data: clients, error } = await supabase
        .from('Clients')
        .select('*');

      if (error) {
        console.error('Clients Error:', error.message);
        throw error;
      }

      // Count only clients that have an email
      const activeCount = clients?.filter((client: any) => 
        client.Email && client.Email.trim() !== ''
      ).length || 0;

      setActiveAccounts(activeCount);
    } catch (error: any) {
      console.error('Error fetching active accounts:', error?.message || 'Unknown error');
    }
  };

  // Sample data
  const recentActivities = [
    { id: 1, type: 'client', message: 'New client registration: John Doe', time: '2 hours ago' },
    { id: 2, type: 'payment', message: 'Payment received: $1,500.00', time: '4 hours ago' },
    { id: 3, type: 'inventory', message: 'Low stock alert: Product XYZ', time: '5 hours ago' },
    { id: 4, type: 'ticket', message: 'New support ticket #123', time: 'Yesterday' },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Client Meeting', time: '2:00 PM', status: 'pending' },
    { id: 2, title: 'Review Proposal', time: '4:30 PM', status: 'completed' },
    { id: 3, title: 'Team Sync', time: 'Tomorrow', status: 'pending' },
  ];

  const periods = ['Today', 'This Week', 'This Month', 'This Year'];

  // Chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [30000, 45000, 42000, 50000, 48000, 52000],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Additional stats
  const topClients = [
    { name: 'Tech Corp', revenue: 15000, growth: 12 },
    { name: 'Global Industries', revenue: 12000, growth: 8 },
    { name: 'Innovate LLC', revenue: 10000, growth: 15 },
  ];

  const quickActions = [
    { name: 'Add Client', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Create Invoice', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Add Product', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
    { name: 'Support Ticket', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  ];

  return (
    <div className="space-y-6 p-4 max-w-[1920px] mx-auto">
      {/* Header with welcome message and period selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {localStorage.getItem('adminName') || 'Admin'}! 👋</h1>
          <p className="text-sm text-gray-600">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-600">
                  {((availableLots / totalLots) * 100).toFixed(1)}% of total
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{availableLots}</h3>
              <p className="text-xs text-gray-600">Available Lots</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Living Water: {livingWaterStats.available}</p>
                  {livingWaterStats.available > 0 && (
                    <Popover className="relative">
                      <Popover.Button className="flex items-center justify-center p-1 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <ChevronRightIcon className="w-4 h-4 text-blue-600" />
                      </Popover.Button>
                      <Transition
                        as={React.Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute z-50 mt-1 w-72 max-h-96 overflow-y-auto transform -translate-x-3/4 left-1/2 sm:px-0">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative bg-white p-4">
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-900">Living Water Available Lots</div>
                                <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  {livingWaterStats.available} lots
                                </div>
                              </div>
                              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {livingWaterAvailableLots.map((lot: LivingWaterProperty) => (
                                  <div key={lot.id} className="p-3 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-white rounded-md border border-gray-200 hover:border-blue-200 transition-all shadow-sm">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                                      <div className="flex items-center">
                                        <div className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-1.5">
                                          <span className="text-xs font-bold">{lot.Block}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Block</span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-1.5">
                                          <span className="text-xs font-bold">{lot.Lot}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Lot</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Lot Area</span>
                                        <span className="text-xs font-medium">{lot["Lot Area"] ? `${lot["Lot Area"]} sqm` : 'N/A'}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">TCP</span>
                                        <span className="text-xs font-medium">{typeof lot.TCP !== 'undefined' && lot.TCP !== null ? `₱${parseFloat(String(lot.TCP)).toLocaleString()}` : 'N/A'}</span>
                                      </div>
                                      {(lot["Price per sqm"] !== undefined && lot["Price per sqm"] !== null) && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500">Price/sqm</span>
                                          <span className="text-xs font-medium">₱{parseFloat(String(lot["Price per sqm"])).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(lot["Monthly Amortization"] !== undefined && lot["Monthly Amortization"] !== null) && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500">Monthly</span>
                                          <span className="text-xs font-medium">₱{parseFloat(String(lot["Monthly Amortization"])).toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Havahills: {havahillsStats.available}</p>
                  {havahillsStats.available > 0 && (
                    <Popover className="relative">
                      <Popover.Button className="flex items-center justify-center p-1 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <ChevronRightIcon className="w-4 h-4 text-blue-600" />
                      </Popover.Button>
                      <Transition
                        as={React.Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute z-50 mt-1 w-72 max-h-96 overflow-y-auto transform -translate-x-3/4 left-1/2 sm:px-0">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative bg-white p-4">
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-900">Havahills Available Lots</div>
                                <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  {havahillsStats.available} lots
                                </div>
                              </div>
                              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {havahillsAvailableLots.map((lot: HavahillsProperty) => (
                                  <div key={lot.id} className="p-3 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-white rounded-md border border-gray-200 hover:border-blue-200 transition-all shadow-sm">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                                      <div className="flex items-center">
                                        <div className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-1.5">
                                          <span className="text-xs font-bold">{lot.Block}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Block</span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-1.5">
                                          <span className="text-xs font-bold">{lot.Lot}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Lot</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Lot Size</span>
                                        <span className="text-xs font-medium">{lot["Lot Size"] ? `${lot["Lot Size"]} sqm` : 'N/A'}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">TCP</span>
                                        <span className="text-xs font-medium">{typeof lot.TCP !== 'undefined' && lot.TCP !== null ? `₱${parseFloat(String(lot.TCP)).toLocaleString()}` : 'N/A'}</span>
                                      </div>
                                      {(lot.Price !== undefined && lot.Price !== null) && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500">Price</span>
                                          <span className="text-xs font-medium">₱{parseFloat(String(lot.Price)).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(lot["1st MA"] !== undefined && lot["1st MA"] !== null) && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500">Monthly</span>
                                          <span className="text-xs font-medium">₱{parseFloat(String(lot["1st MA"])).toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-600">
                  {((soldLots / totalLots) * 100).toFixed(1)}% of total
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{soldLots}</h3>
              <p className="text-xs text-gray-600">Sold Lots</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">Living Water: {livingWaterStats.sold}</p>
                <p className="text-xs text-gray-500">Havahills: {havahillsStats.sold}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600">
                  All Properties
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{totalLots}</h3>
              <p className="text-xs text-gray-600">Total Lots</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">Living Water: {livingWaterStats.total}</p>
                <p className="text-xs text-gray-500">Havahills: {havahillsStats.total}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-yellow-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-yellow-600">
                  With Email
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{activeAccounts}</h3>
              <p className="text-xs text-gray-600">Active Accounts</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Verified clients with email access</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                <p className="text-sm text-gray-500">Monthly revenue performance</p>
              </div>
              <select className="text-sm border-gray-200 rounded-lg">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-72">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Clients</h2>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">${client.revenue.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-medium text-green-600">+{client.growth}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3
                    ${activity.type === 'client' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                      activity.type === 'inventory' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-purple-100 text-purple-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {activity.type === 'client' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                      {activity.type === 'payment' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                      {activity.type === 'inventory' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      )}
                      {activity.type === 'ticket' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Tasks</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className={`text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <span className="text-xs text-gray-500">{task.time}</span>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
