import Link from "next/link";
import { Lock } from "lucide-react";

const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-[#FDFBF7] p-12 text-center rounded-3xl border border-gray-100 shadow-sm">
                {/* Lock Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#FEE2E2] rounded-3xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-[#991B1B]" />
                    </div>
                </div>

                {/* Main Text */}
                <h1 className="text-2xl font-semibold text-[#111827] mb-2 font-sans tracking-tight">
                    Access denied
                </h1>
                <p className="text-[#6B7280] text-sm mb-10 font-medium">
                    You dont have permission to view this page.
                </p>

                {/* Dashboard Button */}
                <Link
                    href="/dashboard"
                    className="inline-block py-3.5 px-8 text-[#111827] font-medium border border-[#E5E7EB] rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200"
                >
                    Go back to dashboard
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;