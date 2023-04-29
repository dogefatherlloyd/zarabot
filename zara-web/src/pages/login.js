import Navbar from "@/components/Navbar";
import { submitVerificationCode } from "@/network";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const router = useRouter();
  const supabase = useSupabaseClient();

  async function handleLogin() {
    const { error } = await supabase.auth.signIn({
      email: email,
      password: password,
    });

    if (error) {
      console.log('Error: ', error.message);
    } else {
      router.push("/account");
    }
  }

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
  
    if (error) {
      console.log('Error: ', error.message);
    } else {
      
    }
  }

  async function handleVerification() {
    const success = await submitVerificationCode(supabase, email, code);
    success && router.push("/account");
  }

  return (
    <>
      <Head>
        <title>Artemis - AI</title>
      </Head>
      <Toaster />
      <div className="flex flex-col h-screen">
      <Navbar />
                <div className="mx-auto max-w-md">
          <div className="border self-center rounded-lg my-8 p-4 m-4">
            <div className="text-center text-xl font-bold text-white">
              {isSignUp ? "Sign Up - Artemis" : "Log In - Artemis"}
            </div>

            <div className=" flex flex-col my-4">
              <label className="font-medium text-gray-600">Email</label>
              <input
                type="email"
                className="border p-2 rounded-md mt-1 text-black"
                placeholder="john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="font-medium text-gray-600 mt-4">Password</label>
              <input
                type="password"
                className="border p-2 rounded-md mt-1 text-black"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignUp ? (
                <button
                  className="w-40 border border-blue-600 text-sm font-medium px-4 py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleSignUp}
                >
                  Sign Up
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-40 border border-blue-600 text-sm font-medium px-4 py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Log In
                </button>
              )}
            </div>
            {isSignUp && (
              <div className=" flex flex-col my-4">
                <label className="font-medium text-gray-600">
                  Verification Code
                </label>
                <input
                  type="text"
                  className="border p-2 rounded-md mt-1 text-black"
                  placeholder="123456"
                  onChange={(e) => setCode(e.target.value)}
                  value={code}
                />
                <button
                  onClick={handleVerification}
                  className="w-40 border border-blue-600 text-sm font-medium px-4 py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Verify
                </button>
              </div>
            )}

            {!isSignUp && (
              <button
                className="w-40 border border-blue-600 text-sm font-medium px-4 py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            )}

            <p className="text-white text-sm prose">
              {"By signing in, you agree to our "}
              <Link href="/terms" className="text-blue-500 hover:text-blue-600">
                terms of use
              </Link>
              {" and "}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}