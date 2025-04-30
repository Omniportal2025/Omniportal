import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getAuthOptions } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import logo from '../assets/HGC LOGO.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Check if this is an email confirmation error
        if (error.message.includes("Email not confirmed")) {
          // Try to resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            ...getAuthOptions()
          });
          
          if (resendError) {
            console.error("Failed to resend confirmation email:", resendError);
            throw new Error(`Email not confirmed. Failed to resend confirmation: ${resendError.message}`);
          } else {
            throw new Error("Email not confirmed. A new confirmation email has been sent. Please check your inbox.");
          }
        }
        
        throw error;
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id);
        
        // Store user email in localStorage
        localStorage.setItem('userEmail', email);

        // Enforce admin access only for emails in Admin table
        // Step 1: Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('Admin')
          .select('Email, Access')
          .eq('Email', email)
          .single();

        if (adminData && adminData.Email === email) {
          const allowedAdminEmails = [
            'guest@gmail.com',
            'angelap.hdc@gmail.com',
            'rowelhal.hdc@gmail.com',
            'hdc.ellainegarcia@gmail.com',
            
          ];
          const adminNames: { [email: string]: string } = {
            'rowelhal.hdc@gmail.com': 'Rowelha',
            'angelap.hdc@gmail.com': 'Angela',
            'guest@gmail.com': 'John Doe',
            'hdc.ellainegarcia@gmail.com': 'Ellaine',
          };
          if (
            (adminData.Access === true || adminData.Access === 'True' || adminData.Access === 'true') &&
            allowedAdminEmails.includes(email)
          ) {
            const adminName = adminNames[email] || 'Admin';
            localStorage.setItem('adminName', adminName);
            console.log(`User is an admin (${adminName}), redirecting to admin dashboard`);
            navigate('/admin');
            return;
          } else {
            // Access is False or email not allowed, block login and show error
            setError('You do not have access to this Dashboard.');
            setIsLoading(false);
            return;
          }
        } else if (adminError && adminError.code !== 'PGRST116') { // PGRST116: No rows found
          // Log unexpected errors (not just 'not found')
          console.error("Error checking Admin table:", adminError);
          setError('An error occurred while verifying admin access.');
          setIsLoading(false);
          return;
        }

        // Step 2: Check if user is a client
        const { data: clientData } = await supabase
          .from('Clients')
          .select('id')
          .eq('auth_id', data.user.id)
          .single();

        if (clientData) {
          // This is a client user
          console.log("User is a client, redirecting to client dashboard");
          navigate('/client-dashboard');
        } else {
          // Not an admin or client
          setError('You do not have access to this Dashboard.');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Modern animated background */}
        <div className="absolute inset-0 bg-gradient-blue animate-gradient-x opacity-10"></div>
        <div className="absolute inset-0 bg-noise-pattern opacity-20"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-50 via-slate-50 to-transparent opacity-80"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow delay-700"></div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30"></div>
            <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30"></div>
          </div>
        </div>
        
        {/* Login container */}
        <div className="w-full max-w-md relative z-10">
          {/* Logo and brand */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-lg shadow-lg mb-4 animate-float backdrop-blur-sm bg-white/80 border border-white/20 p-3">
              <img src={logo} alt="HGC Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight animate-slideUp delay-100">OMNI PORTAL</h1>
            <p className="text-gray-500 mt-1 animate-slideUp delay-200">Premium Real Estate Management</p>
          </div>
          
          {/* Login card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {/* Card header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 animate-slideDown text-center">
              <h2 className="text-white text-xl font-semibold animate-fadeIn delay-300">Sign in to your account</h2>
              <p className="text-blue-100 text-sm mt-1 animate-fadeIn delay-400">Access your dashboard and properties</p>
            </div>
            
            {/* Card body */}
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-slideUp delay-500">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative rounded-md shadow-sm group animate-fadeIn delay-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 ease-in-out hover:border-blue-400"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="animate-slideUp delay-600">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative rounded-md shadow-sm group animate-fadeIn delay-600">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 ease-in-out hover:border-blue-400"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="animate-slideUp delay-800">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-button-gradient bg-[length:200%_100%] relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:animate-button-shimmer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none disabled:animate-none"
                  >
                    {/* Button glow effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:animate-button-shimmer group-hover:opacity-20"></span>
                    
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center relative z-10">
                        <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign in
                      </div>
                    )}
                    
                    {/* Bottom border animation */}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Card footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center animate-fadeIn delay-900">
              <p className="text-xs text-gray-500">
                {new Date().getFullYear()} Omni Portal. All rights reserved.
              </p>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 animate-slideUp delay-1000 hover:transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mb-2 transform transition-all duration-300 hover:bg-blue-200 hover:text-blue-700 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 transition-colors duration-300 hover:text-gray-900">Secure Access</p>
            </div>
            <div className="p-3 animate-slideUp delay-1100 hover:transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mb-2 transform transition-all duration-300 hover:bg-blue-200 hover:text-blue-700 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 transition-colors duration-300 hover:text-gray-900">Property Management</p>
            </div>
            <div className="p-3 animate-slideUp delay-1200 hover:transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mb-2 transform transition-all duration-300 hover:bg-blue-200 hover:text-blue-700 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 transition-colors duration-300 hover:text-gray-900">Real-time Updates</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
