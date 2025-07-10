import React, { createContext, useState, useEffect, useContext } from "react";
import { useMsal } from "@azure/msal-react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { accounts, instance } = useMsal();
  const user = accounts[0] || null;

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user info + role when user changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const email = user.username;
      const name = user.name || email.split("@")[0];

      try {
        // Insert or update user in DB
        await fetch('http://localhost:4000/api/users', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });

        // Fetch role
        const res = await fetch(`http://localhost:4000/api/users/get-role?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (data.role) setRole(data.role);
        else setError("No role found for this user.");
      } catch (err) {
        setError("Failed to fetch user role.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, role, loading, error, instance }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);