//CREATE ACCOUNT PAGE
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const goTo = useRouter();
  async function handlecreateAccount() {
    if (username != "" && password != ""){
      const res = await fetch("http://127.0.0.1:5000/createAccount", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password}),
    });

    const data = await res.json();

    if(!res.ok) {
      setError(data.error);
    } else {
      alert("Account created successfully!");
      goTo.push("/Login")
    }
    }
  }


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-500">Welcome to Touchgrass</h1>
      <p className="text-gray-500 mt-4">Create an Account!</p>

      <div className="mt-8 flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handlecreateAccount}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600"
          >
            Create Account
          </button>
        <Link href = "/Login">
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
}