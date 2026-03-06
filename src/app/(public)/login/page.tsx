"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import ColorBends from "@/components/ColorBends";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    form.clearErrors("root");

    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        // Get redirect URL from query params or default to dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push(redirectTo);
      } else {
        form.setError("root", {
          message:
            result.message || "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/70 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="rounded-md bg-red-500/20 border border-red-500/50 p-3">
              <p className="text-sm text-red-200">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
              />
              <span className="text-white/70">Remember me</span>
            </label>
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-white text-black hover:bg-white/90 h-11 font-medium"
          >
            {isLoading || authLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

const Login = () => {
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <ColorBends
        rotation={1}
        speed={0.2}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.5}
        noise={0.01}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            {/* Glassmorphism overlay effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5" />

            <Suspense
              fallback={
                <div className="relative z-10">
                  <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-white/70 text-sm">
                      Sign in to your account to continue
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="h-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-11 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
