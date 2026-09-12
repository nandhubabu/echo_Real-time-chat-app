import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageCircleMore, Loader2, Mail, User, Lock, Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(formData);
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-base-200/50 p-4 antialiased">
            <div className="w-full max-w-sm rounded-3xl border border-base-300/80 bg-base-100 p-8 shadow-xl">
                {/* Brand Badge */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#00C6FF] text-white shadow-lg shadow-[#007AFF]/25 mb-3">
                        <MessageCircleMore className="size-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-base-content">Create Account</h1>
                    <p className="text-xs text-base-content/50 mt-1">Enter your details to create an account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-base-content/80">Username</label>
                        <div className="relative flex items-center">
                            <User className="pointer-events-none absolute left-3.5 size-4 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="nandhu"
                                className="w-full rounded-2xl border border-base-300/80 bg-base-200/50 py-2.5 pl-10 pr-4 text-xs placeholder:text-base-content/40 focus:border-[#007AFF] focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-base-content/80">Email</label>
                        <div className="relative flex items-center">
                            <Mail className="pointer-events-none absolute left-3.5 size-4 text-base-content/40" />
                            <input
                                type="email"
                                placeholder="nandhu@example.com"
                                className="w-full rounded-2xl border border-base-300/80 bg-base-200/50 py-2.5 pl-10 pr-4 text-xs placeholder:text-base-content/40 focus:border-[#007AFF] focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-base-content/80">Password</label>
                        <div className="relative flex items-center">
                            <Lock className="pointer-events-none absolute left-3.5 size-4 text-base-content/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-base-300/80 bg-base-200/50 py-2.5 pl-10 pr-10 text-xs placeholder:text-base-content/40 focus:border-[#007AFF] focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 text-base-content/40 hover:text-base-content transition-colors"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-[#007AFF] hover:bg-[#0062D2] text-white py-2.5 text-xs font-semibold shadow-md shadow-[#007AFF]/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isSigningUp}
                    >
                        {isSigningUp ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-base-300/50">
                    <p className="text-xs text-base-content/60">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-[#007AFF] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;