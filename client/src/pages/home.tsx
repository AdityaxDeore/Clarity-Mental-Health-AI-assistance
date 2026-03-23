import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useLocation } from "wouter";
import { Heart, Brain, Users, Shield, ArrowRight, Sparkles, LogIn, UserPlus, User, LogOut } from "lucide-react";
import { motion, Transition } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import clarityLogo from "@/assets/clarity-logo.png";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  initialDelay?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  initialDelay = 0
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (initialDelay > 0) {
            setTimeout(() => {
              setStartAnimation(true);
            }, initialDelay);
          } else {
            setStartAnimation(true);
          }
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, initialDelay]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  return (
    <p ref={ref} className={`${className} flex flex-wrap`}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={startAnimation ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
            className="inline-block"
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

export function DemoBackgroundPaths() {
    return <BackgroundPaths title="Welcome to Clarity" />
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleEnterApp = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  };

  const handleLogout = () => {
    logout();
    // Stay on home page after logout
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-gray-900">
      {/* Animated Background Paths */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Authentication Header */}
        <header className="flex justify-between items-center p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-emerald-600" />
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Clarity</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full px-3 py-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.firstName || user.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/login")}
                  className="bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/register")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6 py-0 sm:py-4">
          <div className="w-full max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <img 
                src={clarityLogo} 
                alt="Clarity Logo" 
                className="h-16 w-auto xs:h-20 sm:h-24 md:h-28 lg:h-32 drop-shadow-lg max-w-full"
                onError={(e) => {
                  // Hide if image doesn't load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 dark:text-blue-400 leading-tight px-2 tracking-[-0.02em] [font-family:Poppins,Inter,sans-serif] drop-shadow-[0_8px_24px_rgba(30,64,175,0.22)]">
                Welcome to Clarity
              </h1>
              <div className="space-y-2">
                <BlurText 
                  text="Mental Well-Being Begins With"
                  className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-800 dark:text-slate-100 max-w-5xl mx-auto px-4 leading-snug text-center justify-center tracking-wide"
                  delay={150}
                  animateBy="words"
                  direction="bottom"
                  stepDuration={0.5}
                />
                <BlurText 
                  text="CLARITY"
                  className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black dark:text-black max-w-5xl mx-auto px-4 leading-snug text-center justify-center tracking-[0.08em]"
                  delay={150}
                  animateBy="words"
                  direction="bottom"
                  stepDuration={0.5}
                />
                <BlurText 
                  text="When the Mind Is Clear, the Heart Is at Peace."
                  className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-800 dark:text-slate-100 max-w-5xl mx-auto px-4 leading-snug text-center justify-center tracking-wide"
                  delay={150}
                  animateBy="words"
                  direction="bottom"
                  stepDuration={0.5}
                  initialDelay={2500}
                />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 xxs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xxs:gap-2 sm:gap-4 md:gap-6 max-w-6xl mx-auto mt-6 sm:mt-8 md:mt-12 px-4">
              <Card 
                onClick={() => setLocation('/wellness')}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden cursor-pointer"
                style={{ borderRadius: '16px' }}
              >
                <CardContent className="p-0 relative">
                  <div className="relative p-4 xxs:p-3 sm:p-5 md:p-6 bg-pink-500 text-center transition-all duration-500 group-hover:scale-[1.01]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6 group-hover:scale-125 transition-transform duration-700" />
                    
                    <div className="relative z-10 mx-auto w-fit p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="relative z-10 text-sm sm:text-base font-bold text-white leading-relaxed mt-3">Wellness Tracking</p>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                onClick={() => setLocation('/ai-buddy')}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden cursor-pointer"
                style={{ borderRadius: '16px' }}
              >
                <CardContent className="p-0 relative">
                  <div className="relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-sky-400 to-blue-500 text-center transition-all duration-500 group-hover:scale-[1.01]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6 group-hover:scale-125 transition-transform duration-700" />
                    
                    <div className="relative z-10 mx-auto w-fit p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="relative z-10 text-sm sm:text-base font-bold text-white leading-relaxed mt-3">AI Support</p>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                onClick={() => setLocation('/peer-support')}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden cursor-pointer"
                style={{ borderRadius: '16px' }}
              >
                <CardContent className="p-0 relative">
                  <div className="relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-emerald-400 to-green-500 text-center transition-all duration-500 group-hover:scale-[1.01]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6 group-hover:scale-125 transition-transform duration-700" />
                    
                    <div className="relative z-10 mx-auto w-fit p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="relative z-10 text-sm sm:text-base font-bold text-white leading-relaxed mt-3">Peer Community</p>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                onClick={() => setLocation('/crisis')}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden cursor-pointer"
                style={{ borderRadius: '16px' }}
              >
                <CardContent className="p-0 relative">
                  <div className="relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-violet-400 to-purple-500 text-center transition-all duration-500 group-hover:scale-[1.01]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6 group-hover:scale-125 transition-transform duration-700" />
                    
                    <div className="relative z-10 mx-auto w-fit p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="relative z-10 text-sm sm:text-base font-bold text-white leading-relaxed mt-3">Safe Space</p>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="mt-6 sm:mt-8 md:mt-12 space-y-3 sm:space-y-4 md:space-y-6 px-4">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
                    Welcome back, {user.firstName || user.username}! 👋
                  </p>
                  <div className="inline-block group relative bg-gradient-to-b from-emerald-500/10 via-blue-500/10 to-purple-500/10 dark:from-emerald-400/10 dark:via-blue-400/10 dark:to-purple-400/10 p-px rounded-xl sm:rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Button
                      onClick={handleEnterApp}
                      variant="ghost"
                      className="rounded-[0.9rem] sm:rounded-[1.15rem] px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-semibold backdrop-blur-md bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 text-emerald-700 dark:text-emerald-300 transition-all duration-300 group-hover:-translate-y-0.5 border border-emerald-200 dark:border-emerald-800 hover:shadow-md hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50"
                    >
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                        Go to Dashboard
                      </span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
                    Ready to start your mental wellness journey?
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <div className="inline-block group relative bg-gradient-to-b from-emerald-500/10 via-blue-500/10 to-purple-500/10 dark:from-emerald-400/10 dark:via-blue-400/10 dark:to-purple-400/10 p-px rounded-xl sm:rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <Button
                        onClick={() => setLocation("/register")}
                        variant="ghost"
                        className="rounded-[0.9rem] sm:rounded-[1.15rem] px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-semibold backdrop-blur-md bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 text-emerald-700 dark:text-emerald-300 transition-all duration-300 group-hover:-translate-y-0.5 border border-emerald-200 dark:border-emerald-800 hover:shadow-md hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50"
                      >
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                          Get Started Free
                        </span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Already have an account?{" "}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation("/login")}
                        className="p-0 h-auto text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline"
                      >
                        Sign in
                      </Button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 mt-8 sm:mt-12 md:mt-16 max-w-sm sm:max-w-md mx-auto px-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">Safe</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Environment</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">Free</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Always</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 text-center py-3 sm:py-4 md:py-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 px-4">
          <p className="leading-relaxed">© 2025 Clarity. Supporting student mental health with compassion and innovation.</p>
        </footer>
      </div>
    </div>
  );
}