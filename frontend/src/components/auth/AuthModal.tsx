"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState, AppDispatch } from "@/store";
import { signupAsync, loginAsync, clearError } from "@/store/authSlice";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Sparkles, CheckCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await dispatch(
        loginAsync({
          email: loginForm.email,
          password: loginForm.password,
        })
      ).unwrap();

      toast.success("Welcome back!");
      onClose();
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await dispatch(
        signupAsync({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        })
      ).unwrap();

      toast.success("Account created successfully!");
      onClose();
      setSignupForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-xl font-semibold grammarly-gradient-text">
                Welcome to Vyakaranly
              </DialogTitle>
            </div>
            <p className="text-gray-600">
              Join thousands of users enhancing their Nepali writing with AI
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 bg-white">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-sm">
              <TabsTrigger
                value="login"
                className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Log in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="login-email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                {error && (
                  <div className="grammarly-status-error">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="grammarly-button-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in to Vyakaranly"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, name: e.target.value })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 8 characters)"
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      className="grammarly-input-with-icon"
                    />
                  </div>
                </div>
                {error && (
                  <div className="grammarly-status-error">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-blue-50 rounded-sm p-4 space-y-2">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    What you&apos;ll get:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Save your writing sessions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Advanced AI suggestions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Personal writing insights</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="grammarly-button-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create your free account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
