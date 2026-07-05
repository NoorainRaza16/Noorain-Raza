import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Loader2,
  Lock,
  User,
  Mail,
  EyeOff,
  Eye,
  Shield,
  Hexagon,
  AlertCircle,
  ChevronRight,
  LogIn,
  Key,
} from "lucide-react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SciFiLoginScene from "@/components/admin/SciFiLoginScene";
import SciFiLoading from "@/components/admin/SciFiLoading";

// Client IP Address Component
const FetchClientIP = () => {
  const [ip, setIp] = useState<string>("Detecting...");

  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        const apis = [
          "https://api.ipify.org?format=json",
          "https://api.myip.com",
          "https://ipapi.co/json/",
          "https://api.db-ip.com/v2/free/self",
        ];

        for (const api of apis) {
          try {
            const response = await fetch(api);
            const data = await response.json();
            const ipAddress =
              data.ip || data.ipAddress || data.address || data.IPv4;

            if (ipAddress) {
              setIp(ipAddress);
              return;
            }
          } catch (apiError) {
            console.warn(`Error with ${api}:`, apiError);
          }
        }

        setIp("173.238.152.98");
      } catch (error) {
        console.error("Error fetching IP:", error);
        setIp("173.238.152.98");
      }
    };

    fetchIpAddress();
  }, []);

  return <span>{ip}</span>;
};

// Device Details Component
const DeviceDetails = () => {
  const [deviceName, setDeviceName] = useState<string>("Detecting...");

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      let device = "";

      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        device = "TABLET";
      } else if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          ua,
        )
      ) {
        device = "MOBILE";
      } else {
        device = "DESKTOP";
      }

      if (/Windows/.test(ua)) device += " (WINDOWS)";
      else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(ua)) device += " (MAC)";
      else if (/iPad|iPhone|iPod/.test(ua)) device += " (iOS)";
      else if (/Android/.test(ua)) device += " (ANDROID)";
      else if (/Linux/.test(ua)) device += " (LINUX)";

      setDeviceName(device);
    };

    detectDevice();
  }, []);

  return <span>{deviceName}</span>;
};

// Enhanced Location Component with multiple fallback methods
const LocationComponent = () => {
  const [location, setLocation] = useState<string>("Detecting...");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Method 1: Try GPS geolocation first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("GPS location obtained:", latitude, longitude);
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                  {
                    headers: {
                      "User-Agent": "AdminPortal/1.0",
                    },
                  },
                );
                const data = await response.json();

                if (data && data.address) {
                  const city =
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.county;
                  const state = data.address.state || data.address.region;
                  const country = data.address.country_code?.toUpperCase();

                  let locationStr = "";
                  if (city) locationStr += city;
                  if (state && state !== city)
                    locationStr += locationStr ? `, ${state}` : state;
                  if (country)
                    locationStr += locationStr ? `, ${country}` : country;

                  setLocation(
                    locationStr ||
                      `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                  );
                  return;
                } else {
                  setLocation(
                    `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                  );
                  return;
                }
              } catch (error) {
                console.warn("Error getting location name:", error);
                setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                return;
              }
            },
            async (error) => {
              console.warn("Geolocation error:", error);
              // Fall back to IP-based location
              await tryIPLocation();
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            },
          );
        } else {
          // No geolocation support, use IP-based location
          await tryIPLocation();
        }
      } catch (error) {
        console.error("Location error:", error);
        await tryIPLocation();
      }
    };

    // Method 2: IP-based geolocation fallback
    const tryIPLocation = async () => {
      try {
        console.log("Trying IP-based geolocation...");

        // Try multiple IP geolocation services
        const ipLocationAPIs = [
          {
            url: "https://ipapi.co/json/",
            parser: (data: any) => {
              if (data.city && data.region && data.country_code) {
                return `${data.city}, ${data.region}, ${data.country_code.toUpperCase()}`;
              }
              return null;
            },
          },
          {
            url: "https://api.db-ip.com/v2/free/self",
            parser: (data: any) => {
              if (data.city && data.stateProv && data.countryCode) {
                return `${data.city}, ${data.stateProv}, ${data.countryCode.toUpperCase()}`;
              }
              return null;
            },
          },
          {
            url: "https://ipgeolocation.abstractapi.com/v1/?api_key=YOUR_API_KEY",
            parser: (data: any) => {
              if (data.city && data.region && data.country_code) {
                return `${data.city}, ${data.region}, ${data.country_code.toUpperCase()}`;
              }
              return null;
            },
          },
        ];

        for (const api of ipLocationAPIs) {
          try {
            console.log(`Trying API: ${api.url}`);
            const response = await fetch(api.url);

            if (!response.ok) {
              console.warn(
                `API ${api.url} returned status: ${response.status}`,
              );
              continue;
            }

            const data = await response.json();
            console.log(`API response:`, data);

            const locationString = api.parser(data);
            if (locationString) {
              console.log(`Location found: ${locationString}`);
              setLocation(locationString);
              return;
            }
          } catch (apiError) {
            console.warn(`Error with ${api.url}:`, apiError);
          }
        }

        // If all IP services fail, try a simple timezone-based guess
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Using timezone for location guess:", timezone);

        const timezoneToLocation: Record<string, string> = {
          "America/New_York": "New York, NY, US",
          "America/Los_Angeles": "Los Angeles, CA, US",
          "America/Chicago": "Chicago, IL, US",
          "America/Denver": "Denver, CO, US",
          "Europe/London": "London, UK",
          "Europe/Paris": "Paris, FR",
          "Europe/Berlin": "Berlin, DE",
          "Asia/Tokyo": "Tokyo, JP",
          "Asia/Shanghai": "Shanghai, CN",
          "Asia/Kolkata": "Mumbai, IN",
          "Australia/Sydney": "Sydney, AU",
        };

        const guessedLocation = timezoneToLocation[timezone];
        if (guessedLocation) {
          setLocation(`${guessedLocation} (Timezone-based)`);
        } else {
          // Extract region from timezone
          const parts = timezone.split("/");
          if (parts.length >= 2) {
            const region = parts[0].replace("_", " ");
            const city = parts[1].replace("_", " ");
            setLocation(`${city}, ${region} (Estimated)`);
          } else {
            setLocation("Location Unavailable");
          }
        }
      } catch (error) {
        console.error("IP location error:", error);
        setLocation("Location Unavailable");
      }
    };

    fetchLocation();
  }, []);

  return <span>{location}</span>;
};

// Real-time Date and Time Display Component
const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>("Detecting...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    // Get timezone information
    const getTimezoneInfo = async () => {
      try {
        // Get user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(userTimezone);

        // Try to get GPS coordinates for more accurate timezone
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setCoordinates({ lat: latitude, lon: longitude });

              // Try to get timezone from coordinates using a service
              try {
                const response = await fetch(
                  `https://api.ipgeolocation.io/timezone?apiKey=YOUR_API_KEY&lat=${latitude}&long=${longitude}`,
                );
                if (response.ok) {
                  const data = await response.json();
                  if (data.timezone) {
                    setTimezone(data.timezone);
                  }
                }
              } catch (error) {
                console.warn("Timezone API error:", error);
                // Keep the browser detected timezone
              }
            },
            (error) => {
              console.warn("Geolocation for timezone failed:", error);
              // Keep the browser detected timezone
            },
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 300000,
            },
          );
        }
      } catch (error) {
        console.error("Timezone detection error:", error);
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    };

    getTimezoneInfo();

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format date and time
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone !== "Detecting..." ? timezone : undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return {
      date: date.toLocaleDateString("en-GB", {
        timeZone: timezone !== "Detecting..." ? timezone : undefined,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      time: date.toLocaleTimeString("en-GB", {
        timeZone: timezone !== "Detecting..." ? timezone : undefined,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      timezone: timezone.split("/").pop()?.replace("_", " ") || timezone,
    };
  };

  const { date, time, timezone: displayTimezone } = formatDateTime(currentTime);

  return (
    <span className="font-mono">
      {time} | {date} ({displayTimezone})
    </span>
  );
};

// Login schema with all required fields
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SciFiLoginPage() {
  const { user, isLoading: authLoading, loginMutation, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // State management
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<
    "initializing" | "authenticating" | "success" | "error"
  >("initializing");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
          userAgent,
        );

      setIsMobile(isMobileDevice || width < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialization sequence
  useEffect(() => {
    const bootTimeout = setTimeout(() => {
      setIsInitializing(false);

      const formTimeout = setTimeout(() => {
        setIsFormVisible(true);
      }, 1000);

      return () => clearTimeout(formTimeout);
    }, 3000);

    return () => clearTimeout(bootTimeout);
  }, []);

  // Handle 3D scene loaded
  const handleSceneLoaded = () => {
    setSceneLoaded(true);
  };

  // Check if already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated && user && !isAuthenticating) {
      console.log("Already authenticated, redirecting to dashboard");
      navigate("/admin");
    }
  }, [isAuthenticated, user, navigate, isAuthenticating]);

  // Login form with validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  } as const);

  // Handle login form submission
  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsAuthenticating(true);
    setLoadingStatus("authenticating");

    loginMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    }, {
      onSuccess: () => {
        setLoadingStatus("success");
        setIsAuthenticating(false);
        // Remove any toast notifications to prevent layout issues
      },
      onError: (error: any) => {
        console.error("Login error:", error);
        setLoginError("AUTHENTICATION FAILED");
        setLoadingStatus("error");
        setIsAuthenticating(false);
        
        form.reset((values) => ({
          ...values,
          password: "",
        }));
      }
    });
  };

  // Enhanced loading screen during auth
  if (isAuthenticating) {
    return (
      <SciFiLoading
        status={loadingStatus}
        message={
          loadingStatus === "authenticating"
            ? "ESTABLISHING SECURE CONNECTION TO ADMIN SUBSYSTEM"
            : "GRANTING ACCESS TO ADMINISTRATOR PORTAL"
        }
        errorMessage="AUTHENTICATION FAILED"
      />
    );
  }

  // Initial loading/boot screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-cyan-400 font-mono">
        <div className="w-full max-w-2xl space-y-4">
          <div className="mb-4">
            <div className="text-xs animate-typing overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 pr-1 w-80">
              &gt; INITIALIZING QUANTUM SECURITY FRAMEWORK...
            </div>
          </div>
          <div className="mb-4">
            <div
              className="text-xs animate-typing overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 pr-1 w-80"
              style={{ animationDelay: "1s" }}
            >
              &gt; LOADING AUTHENTICATION MODULE...
            </div>
          </div>
          <div className="mb-4">
            <div className="h-1 bg-gray-900 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-[dataPacketMove_2s_linear_forwards]"></div>
            </div>
          </div>
          <div className="text-center text-xs animate-pulse">
            [SYSTEM READY]
          </div>
        </div>
      </div>
    );
  }

  // Main login page with 3D scene
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 3D Background Scene */}
      <SciFiLoginScene onLoaded={handleSceneLoaded} isAnimating={true} />

      {/* Main content overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Main login container */}
          <AnimatePresence mode="wait">
            {isFormVisible && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  duration: 0.8,
                }}
                className="relative"
              >
                {/* Outer glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-cyan-500/30 to-blue-600/20 blur-xl rounded-2xl opacity-70"></div>

                {/* Main card with cyber styling */}
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-cyan-900/50 rounded-xl p-6 sm:p-8 sci-fi-box-glow">
                  {/* Header section with animated logo */}
                  <div className="text-center mb-8">
                    {/* Animated shield logo */}
                    <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                      <div className="relative">
                        {/* Outer ring with rotation */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-cyan-400/30 w-20 h-20"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        {/* Inner ring with reverse rotation */}
                        <motion.div
                          className="absolute inset-2 rounded-full border border-blue-500/40 w-16 h-16"
                          animate={{ rotate: -360 }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        {/* Center shield icon */}
                        <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full">
                          <Shield className="h-10 w-10 text-cyan-400 animate-pulse" />
                        </div>

                        {/* Glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              "0 0 15px rgba(6, 182, 212, 0.5)",
                              "0 0 30px rgba(6, 182, 212, 0.7)",
                              "0 0 15px rgba(6, 182, 212, 0.5)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                    </div>

                    {/* Title with futuristic styling */}
                    <h2 className="text-center font-mono tracking-wide text-base sm:text-lg text-blue-100 mb-1 sci-fi-text-glow">
                      ADMIN AUTHORIZATION PORTAL
                    </h2>

                    {/* Status indicator */}
                    <div className="text-cyan-400 text-xs font-mono opacity-80 tracking-wider flex items-center justify-center">
                      <span className="animate-pulse mr-1">●</span>
                      <span>SECURE ACCESS POINT</span>
                    </div>
                  </div>

                  {/* Error display */}
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
                    >
                      <div className="flex items-center text-red-400 text-sm font-mono">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>{loginError}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Login form */}
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {/* Username field */}
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-400 font-mono text-sm flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              USERNAME
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="Enter username"
                                  className="bg-gray-800/50 border-cyan-900/50 text-cyan-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono sci-fi-border-glow"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 font-mono text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Email field */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-400 font-mono text-sm flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              EMAIL ADDRESS
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter email address"
                                  className="bg-gray-800/50 border-cyan-900/50 text-cyan-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono sci-fi-border-glow"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 font-mono text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Password field */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-cyan-400 font-mono text-sm flex items-center">
                              <Lock className="w-4 h-4 mr-2" />
                              SECURITY KEY
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter security key"
                                  className="bg-gray-800/50 border-cyan-900/50 text-cyan-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono pr-10 sci-fi-border-glow"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 font-mono text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Remember me checkbox */}
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-gray-300 font-mono">
                                MAINTAIN SESSION
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Submit button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={authLoading || isAuthenticating}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono tracking-wider py-3 rounded-lg border border-cyan-400/50 sci-fi-box-glow transition-all duration-300"
                        >
                          {authLoading || isAuthenticating ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              <span>AUTHENTICATING...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <LogIn className="w-4 h-4 mr-2" />
                              <span>INITIATE LOGIN SEQUENCE</span>
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>

                  {/* Connection status panel */}
                  <div className="mt-6 mb-6 p-3 bg-black/30 rounded border border-gray-800">
                    <div className="text-xs font-mono text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Local Time:</span>
                        <span className="text-cyan-400">
                          <DateTimeDisplay />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className="text-cyan-400">
                          <FetchClientIP />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span className="text-cyan-400">
                          <DeviceDetails />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-cyan-400">
                          <LocationComponent />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocol:</span>
                        <span className="text-emerald-400">
                          TLS 1.3 / AES-256
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="mt-6 text-center">
                    <div className="text-xs text-gray-500 font-mono flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <Activity className="w-3 h-3 mr-1 text-cyan-400" />
                        <span>SECURE</span>
                      </div>
                      <div className="flex items-center">
                        <Key className="w-3 h-3 mr-1 text-emerald-400" />
                        <span>ENCRYPTED</span>
                      </div>
                      <div className="flex items-center">
                        <Hexagon className="w-3 h-3 mr-1 text-blue-400" />
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
