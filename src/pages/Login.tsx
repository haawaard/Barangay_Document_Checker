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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <NavbarLayout>

      {/* Main Section */}
      <main className="mt-24 w-full max-w-2xl text-center">
        <motion.h2
          className="text-4xl font-extrabold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Barangay Log In
        </motion.h2>
        <p className="text-sm text-gray-400 mb-6">
          *This page is only for Barangay Officials
        </p>

        <Card className="bg-blue-950 border-none shadow-xl rounded-2xl">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-700 p-3 rounded-full">
              <img src="/images/SystemLogo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            </div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-blue-900 text-white border-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-blue-900 text-white border-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleLogin} className="bg-blue-700 hover:bg-blue-600">
              Log In
            </Button>
          </CardContent>
          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}
        </Card>
      </main>
      </NavbarLayout>
    </div>
  );
}

