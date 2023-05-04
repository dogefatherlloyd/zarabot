import { useState, useEffect } from "react";
import fetch from "isomorphic-unfetch";

export default function Dashboard() {
  const [accountData, setAccountData] = useState(null);

  const fetchAccountData = async () => {
    try {
      const res = await fetch("/api/account"); // Update the URL here
  
      if (res.ok) {
        const account = await res.json();
        setAccountData(account);
      } else {
        console.error("Error fetching account data:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {accountData ? (
        <div>
          <p>Equity: {accountData.equity}</p>
          <p>Buying Power: {accountData.buying_power}</p>
        </div>
      ) : (
        <p>Loading account data...</p>
      )}
    </div>
  );
}