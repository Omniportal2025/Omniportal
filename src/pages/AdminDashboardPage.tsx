import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import { usePayment } from '../contexts/PaymentContext';
import { useTicket } from '../contexts/TicketContext';
import logo from '../assets/HGC LOGO.png';

// Define types for menu items
type MenuItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  type: 'item' | 'divider';
  restricted?: boolean;
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRestrictedUser, setIsRestrictedUser] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pendingPaymentsCount } = usePayment();
  const { newTicketsCount } = useTicket();

  // Re-enable auth check
  useEffect(() => {
    checkAdminAuth();
    // Check if user is restricted
    const userEmail = localStorage.getItem('userEmail');
    setIsRestrictedUser(userEmail === 'hdc.ellainegarcia@gmail.com');
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Allowed admin emails
      const allowedAdminEmails = [
        'guest@gmail.com',
        'angelap.hdc@gmail.com',
        'rowelhal.hdc@gmail.com',
        'hdc.ellainegarcia@gmail.com',
        
      ];

      // Check if user's email exists in Clients table
      const { data: client } = await supabase
        .from('Clients')
        .select('Email')
        .eq('Email', user.email)
        .single();

      // If user is found in Clients table, they are not an admin
      if (client) {
        navigate('/dashboard');
        return;
      }

      // If user's email is not defined or not in allowed admin emails, redirect to login
      if (!user.email || !allowedAdminEmails.includes(user.email)) {
        navigate('/login');
        return;
      }

    } catch (err: any) {
      console.error('Auth error:', err.message);
      navigate('/login');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userEmail'); // Clear the stored email
      navigate('/login');
    } catch (err: any) {
      console.error('Sign out error:', err.message);
    }
  };

  // Menu items configuration with restricted property
  const menuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      restricted: true
    },
    { 
      name: 'Inventory', 
      path: '/admin/inventory', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
      restricted: true
    },
    { 
      name: 'Clients', 
      path: '/admin/clients', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
      restricted: false
    },
    { 
      name: 'Documents', 
      path: '/admin/documents', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      restricted: false
    },
    { 
      name: 'Payment', 
      path: '/admin/payment', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
      restricted: true
    },
    { 
      name: 'Balance', 
      path: '/admin/balance', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      restricted: true
    },
    { 
      name: 'Report', 
      path: '/admin/report', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      restricted: true
    },
    { type: 'divider', name: 'Support', path: '' },
    { 
      name: 'Ticket', 
      path: '/admin/ticket', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
      restricted: false
    },
    { 
      name: 'Team Chat', 
      path: '/admin/team-chat', 
      type: 'item',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
      restricted: false
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow p-2">
                <img src={logo} alt="HGC Logo" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Omni Portal
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">Admin Dashboard</span>
              </div>
            </div>

            {/* Close button - only visible on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                // Skip rendering if item is restricted for restricted user
                if (isRestrictedUser && item.restricted) {
                  return null;
                }

                return item.type === 'divider' ? (
                  <li key={index} className="my-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-start">
                        <span className="pr-3 text-sm font-medium text-gray-500 bg-white">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </li>
                ) : (
                  <Link
                    key={index}
                    to={item.path}
                    className={`group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                      ${location.pathname === item.path 
                        ? 'text-blue-600'
                        : 'text-slate-600 hover:text-blue-600'
                      }`}
                  >
                    {/* Hover effect background */}
                    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100
                      bg-gradient-to-r from-blue-50 to-indigo-50`}></div>
                    
                    {/* Active indicator */}
                    {location.pathname === item.path && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-blue-600 rounded-r-full"></div>
                    )}

                    {/* Icon */}
                    <span className={`relative flex items-center justify-center w-8 h-8 mr-3 rounded-lg 
                      transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3
                      ${location.pathname === item.path 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-blue-50 text-blue-600'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </span>

                    {/* Text and Badge Container */}
                    <div className="relative flex items-center justify-between flex-grow">
                      <span className="relative">{item.name}</span>
                      
                      {/* Payment Notification Badge */}
                      {item.name === 'Payment' && pendingPaymentsCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm shadow-red-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-px">
                          {pendingPaymentsCount}
                        </span>
                      )}

                      {/* Ticket Notification Badge */}
                      {item.name === 'Ticket' && newTicketsCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-px">
                          {newTicketsCount}
                        </span>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    {location.pathname === item.path && (
                      <span className="relative ml-3 transform transition-transform duration-300 group-hover:translate-x-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </Link>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="group relative flex items-center w-full px-4 py-3 text-sm font-medium 
                text-red-600 hover:text-red-700 rounded-xl transition-all duration-300 overflow-hidden"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 rounded-xl transition-all duration-500 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-red-50 via-orange-50 to-red-50 bg-[length:200%_100%] group-hover:animate-shimmer"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 mr-3 rounded-lg 
                bg-red-50 text-red-600 transition-all duration-300 
                group-hover:scale-110 group-hover:-rotate-12 group-hover:shadow-lg group-hover:shadow-red-500/20">
                {/* Icon */}
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        className="transition-all duration-300 group-hover:stroke-[2.5]" />
                </svg>
              </div>
              
              {/* Text */}
              <span className="relative z-10 font-medium tracking-wide transform transition-all duration-300 
                group-hover:translate-x-1 group-hover:font-semibold">
                Log Out
              </span>

              {/* Decorative dot */}
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-red-500/40 
                transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-150"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-900">
            {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
