import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import NavbarLayout from "./Nlayout";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!name || !password) {
      setError("Please enter both name and password.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('isAuthenticated', 'true');
        navigate("/dashboard", { replace: true });
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    }
  };

  // If already authenticated, redirect away from login
  useEffect(() => {
    const authed = sessionStorage.getItem('isAuthenticated') === 'true';
    if (authed) {
      navigate('/dashboard', { replace: true });
    }

    // Ensure back button from login doesn't go to protected pages when unauthenticated
    const onPopState = () => {
      const stillAuthed = sessionStorage.getItem('isAuthenticated') === 'true';
      if (!stillAuthed) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-xl"></div>
      </div>

      <NavbarLayout>
        {/* Main Section */}
        <main className="mt-24 w-full max-w-2xl text-center relative z-10">
          {/* Header Section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 shadow-2xl p-2">
              <img src="/images/SystemLogo.png" alt="Barangay Logo" className="w-12 h-12 rounded-full object-cover" />
            </div>
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Official Login
            </h2>
            <p className="text-lg text-gray-300 mb-2">
              Secure access for authorized personnel
            </p>
            <p className="text-sm text-gray-400 bg-yellow-900/20 border border-yellow-600/30 rounded-lg px-4 py-2 inline-block">
              🔒 This portal is exclusively for Barangay Officials
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/20 via-slate-800/20 to-blue-900/20 backdrop-blur-xl border border-blue-700/30 shadow-2xl rounded-3xl overflow-hidden relative">
              {/* Card decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full translate-y-10 -translate-x-10"></div>
              
              <CardContent className="relative z-10 p-8">


                {/* Input Fields */}
                <div className="space-y-6 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Official Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-800/60 text-white border border-gray-600/50 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 pl-12"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Secure Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-800/60 text-white border border-gray-600/50 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 pl-12"
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={!name || !password}
                  >
                    🔓 Access Dashboard
                  </Button>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="mt-6 p-4 bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/50 rounded-xl text-red-100"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Authentication Error</span>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{error}</p>
                  </motion.div>
                )}

                {/* Security Notice */}
                <motion.div
                  className="mt-8 p-4 bg-blue-900/30 border border-blue-600/40 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-yellow-400 font-medium text-sm">Security Notice</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This system is monitored for security purposes. All login attempts are logged and tracked. Unauthorized access is strictly prohibited.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <p className="text-gray-500 text-sm">
              Need assistance? Contact your system administrator
            </p>
          </motion.div>
        </main>
      </NavbarLayout>
    </div>
  );
}

