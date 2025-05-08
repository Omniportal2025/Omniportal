import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  ListBulletIcon,
  MapPinIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const DashboardContent: React.FC = () => {
  const [availableLots, setAvailableLots] = useState<number>(0);
  const [soldLots, setSoldLots] = useState<number>(0);
  const [totalLots, setTotalLots] = useState<number>(0);
  const [activeAccounts, setActiveAccounts] = useState<number>(0);
  const [livingWaterStats, setLivingWaterStats] = useState<{ available: number, sold: number, total: number }>({ available: 0, sold: 0, total: 0 });
  const [havahillsStats, setHavahillsStats] = useState<{ available: number, sold: number, total: number }>({ available: 0, sold: 0, total: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [propertyMetrics, setPropertyMetrics] = useState({
    totalArea: 0,
    averagePrice: 0,
    occupancyRate: 0,
    reservationRate: 0,
  });

  useEffect(() => {
    fetchLotData();
    fetchActiveAccounts();
    fetchRecentTransactions();
    fetchNotifications();
    fetchUpcomingPayments();
    fetchTasks();
    fetchPropertyMetrics();
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
        setLivingWaterStats({ available: 0, sold: 0, total: 0 });
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
      }
      
      if (havahillsError) {
        console.error('Havahills Error:', havahillsError.message);
        setHavahillsStats({ available: 0, sold: 0, total: 0 });
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
      setLivingWaterStats({ available: 0, sold: 0, total: 0 });
      setHavahillsStats({ available: 0, sold: 0, total: 0 });
      setAvailableLots(0);
      setSoldLots(0);
      setTotalLots(0);
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

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error?.message);
      setRecentTransactions([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('Notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error?.message);
      setNotifications([]);
    }
  };

  const fetchUpcomingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('Payments')
        .select('*')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching upcoming payments:', error?.message);
      setUpcomingPayments([]);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('Tasks')
        .select('*')
        .order('priority', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error?.message);
      setTasks([]);
    }
  };

  const fetchPropertyMetrics = async () => {
    try {
      const { data: livingWater, error: lwError } = await supabase
        .from('Living Water Subdivision')
        .select('*');
      
      const { data: havahills, error: hhError } = await supabase
        .from('Havahills Estate')
        .select('*');

      if (lwError || hhError) throw lwError || hhError;

      const allProperties = [...(livingWater || []), ...(havahills || [])];
      const totalArea = allProperties.reduce((sum, prop) => sum + (prop.area || 0), 0);
      const averagePrice = allProperties.reduce((sum, prop) => sum + (prop.price || 0), 0) / allProperties.length;
      const occupied = allProperties.filter(prop => prop.Status?.toLowerCase() === 'sold').length;
      const reserved = allProperties.filter(prop => prop.Status?.toLowerCase() === 'reserved').length;

      setPropertyMetrics({
        totalArea,
        averagePrice,
        occupancyRate: (occupied / allProperties.length) * 100,
        reservationRate: (reserved / allProperties.length) * 100,
      });
    } catch (error: any) {
      console.error('Error fetching property metrics:', error?.message);
    }
  };

  // Mock data for sales performance
  const salesData = [
    { month: 'Jan', sales: 12 },
    { month: 'Feb', sales: 15 },
    { month: 'Mar', sales: 10 },
    { month: 'Apr', sales: 18 },
    { month: 'May', sales: 22 },
    { month: 'Jun', sales: 25 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-[1920px] mx-auto p-4">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Welcome back, {localStorage.getItem('adminName') || 'Admin'}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Here's your dashboard overview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Stats Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-md">
                      <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Available Lots</p>
                      <p className="text-sm font-semibold text-gray-900">{availableLots}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">
                    {((availableLots / totalLots) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-100 p-1.5 rounded-md">
                      <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sold Lots</p>
                      <p className="text-sm font-semibold text-gray-900">{soldLots}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md">
                    {((soldLots / totalLots) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-md">
                      <ChartBarIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Lots</p>
                      <p className="text-sm font-semibold text-gray-900">{totalLots}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">
                    Total
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-amber-100 p-1.5 rounded-md">
                      <UserGroupIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Active Accounts</p>
                      <p className="text-sm font-semibold text-gray-900">{activeAccounts}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Links</h2>
              <div className="space-y-1.5">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <DocumentDuplicateIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">View Available Lots</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                  <div className="bg-emerald-100 p-1.5 rounded-md">
                    <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Manage Clients</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Sales Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Living Water Subdivision</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-md">In Progress</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Available Lots</span>
                    <span className="font-medium text-gray-900">{livingWaterStats.available}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(livingWaterStats.available / livingWaterStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Total Lots</span>
                    <span className="font-medium text-gray-900">{livingWaterStats.total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Havahills Estate</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-md">Active</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Available Lots</span>
                    <span className="font-medium text-gray-900">{havahillsStats.available}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(havahillsStats.available / havahillsStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Total Lots</span>
                    <span className="font-medium text-gray-900">{havahillsStats.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Sales Performance</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
              </div>
              <div className="h-64">
                <div className="flex items-end justify-between h-48 space-x-2">
                  {salesData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                      <div 
                        className="w-full bg-blue-100 rounded-t-lg transition-all duration-300 hover:bg-blue-200"
                        style={{ height: `${(data.sales / 25) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-600">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-purple-100 p-1.5 rounded-md">
                    <ChartPieIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-purple-600">Analytics</span>
                </div>
                <h4 className="text-sm text-gray-600">Total Area</h4>
                <p className="text-lg font-semibold text-gray-900">{propertyMetrics.totalArea.toLocaleString()} sqm</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <BanknotesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">Price</span>
                </div>
                <h4 className="text-sm text-gray-600">Average Price</h4>
                <p className="text-lg font-semibold text-gray-900">₱{propertyMetrics.averagePrice.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-100 p-1.5 rounded-md">
                    <MapPinIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600">Occupancy</span>
                </div>
                <h4 className="text-sm text-gray-600">Occupancy Rate</h4>
                <p className="text-lg font-semibold text-gray-900">{propertyMetrics.occupancyRate.toFixed(1)}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-amber-100 p-1.5 rounded-md">
                    <TagIcon className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-600">Reserved</span>
                </div>
                <h4 className="text-sm text-gray-600">Reservation Rate</h4>
                <p className="text-lg font-semibold text-gray-900">{propertyMetrics.reservationRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Task Management and Payment Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-gray-900">Task Management</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      {tasks.length}
                    </span>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Add Task</button>
                </div>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-md ${
                          task.priority === 'high' ? 'bg-red-100' : 
                          task.priority === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
                          <ListBulletIcon className={`w-4 h-4 ${
                            task.priority === 'high' ? 'text-red-600' : 
                            task.priority === 'medium' ? 'text-amber-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Payment Schedule</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View Calendar</button>
                </div>
                <div className="space-y-3">
                  {upcomingPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-1.5 rounded-md">
                          <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">₱{payment.amount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{payment.client_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">Due Date</p>
                        <p className="text-xs text-gray-500">{new Date(payment.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-1.5 rounded-md">
                        <BanknotesIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.amount}</p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>

                    </div>
                    <span className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    {notifications.length}
                  </span>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Clear All</button>
              </div>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-md ${
                        notification.type === 'success' ? 'bg-green-100' : 'bg-amber-100'
                      }`}>
                        {notification.type === 'success' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ExclamationCircleIcon className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-md">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New lot reservation</p>
                      <p className="text-xs text-gray-500">Living Water Subdivision - Block 1, Lot 23</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-100 p-1.5 rounded-md">
                      <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New client registration</p>
                      <p className="text-xs text-gray-500">John Doe - Havahills Estate</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
