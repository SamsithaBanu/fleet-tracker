"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "@/lib/api";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background soft glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#088395]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2C687B]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Logo */}
            <Link href="/" className="mb-10 flex items-center gap-2 group transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#088395] flex items-center justify-center shadow-lg shadow-[#088395]/20 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                    </svg>
                </div>
                <span className="font-bold text-2xl tracking-tight text-[#2C687B]">FleetTracker</span>
            </Link>

            {/* Login Card */}
            <div className="w-full max-w-md">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="relative z-10">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@fleettracker.io"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/10 transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                    <Link href="#" className="text-[10px] font-bold text-[#088395] hover:text-[#2C687B] transition-colors uppercase tracking-widest">Forgot?</Link>
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#088395] focus:ring-2 focus:ring-[#088395]/10 transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#088395] hover:bg-[#2C687B] text-white disabled:bg-slate-300 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#088395]/20 hover:shadow-lg hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Sign in"}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-sm font-medium">
                                Don't have an account? <Link href="/register" className="font-bold text-[#088395] hover:text-[#2C687B] transition-colors">Sign up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
