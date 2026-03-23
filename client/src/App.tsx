import { Switch, Route, useLocation, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SOSButton } from "@/components/sos-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ProfilePage from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import AIBuddyPage from "@/pages/ai-buddy";
import WellnessPage from "@/pages/wellness";
import GoalsPage from "@/pages/goals";
import PeerSupportPage from "@/pages/peer-support";
import ResourcesPage from "@/pages/resources";
import ProfessionalCommunityPage from "@/pages/professional-community";
import CreativePage from "@/pages/creative";
import CrisisPage from "@/pages/crisis";
import SettingsPage from "@/pages/settings";
import OnboardingPage from "@/pages/onboarding";
import AnonymousChatPage from "@/pages/anonymous-chat";
import AdminPage from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import ReportPage from "@/pages/report";
import CommunityRoute from "@/pages/community";
import AudioSessionsPage from "@/pages/audio-sessions";
import DiaryPage from "@/pages/diary";
import MentorshipPage from "@/pages/mentorship";
import AssessmentPage from "@/pages/assessment";
import InteractiveMenuDemo from "@/pages/interactive-menu-demo";
import GamesPage from "@/pages/games";
import PetCareGamePage from "@/pages/petcare-game";
import ReactionStreakPage from "@/pages/reaction-streak";
import EmojiMorphDemo from "@/pages/emoji-morph-demo";
import InnerGatekeeperPage from "@/pages/inner-gatekeeper";

function RouterComponent() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/ai-buddy" component={AIBuddyPage} />
      <Route path="/anonymous-chat" component={AnonymousChatPage} />
      <Route path="/wellness" component={WellnessPage} />
      <Route path="/assessment" component={AssessmentPage} />
      <Route path="/audio-sessions" component={AudioSessionsPage} />
      <Route path="/diary" component={DiaryPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/mentorship" component={MentorshipPage} />
      <Route path="/peer-support" component={PeerSupportPage} />
      <Route path="/community/:id" component={CommunityRoute} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/professional-community" component={ProfessionalCommunityPage} />
      <Route path="/creative" component={CreativePage} />
      <Route path="/crisis" component={CrisisPage} />
      <Route path="/report" component={ReportPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/petcare-game" component={PetCareGamePage} />
      <Route path="/reaction-streak" component={ReactionStreakPage} />
      <Route path="/emoji-morph-demo" component={EmojiMorphDemo} />
      <Route path="/inner-gatekeeper" component={InnerGatekeeperPage} />
      <Route path="/menu-demo" component={InteractiveMenuDemo} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const appBase =
    typeof window !== "undefined" && window.location.hostname.includes("github.io")
      ? "/Clarity"
      : "";
  const normalizedLocation = location.startsWith("/Clarity")
    ? location.replace("/Clarity", "") || "/"
    : location;
  
  // Show SOS button only on dashboard page
  const showSOSButton = normalizedLocation === "/dashboard";
  
  // Routes that should not show the normal app layout
  const isSpecialRoute =
    normalizedLocation === "/" ||
    normalizedLocation === "" ||
    normalizedLocation === "/login" ||
    normalizedLocation === "/register" ||
    normalizedLocation === "/admin-login" ||
    normalizedLocation === "/admin";
  
  // Navigation handler
  const handleNavigation = (path: string) => {
    setLocation(path);
  };
  
  // Custom sidebar width for mental health application
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // If it's a special route (home, admin, auth), render without the normal app layout
  if (isSpecialRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router base={appBase}>
              <div className="min-h-screen">
                <RouterComponent />
              </div>
            </Router>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Router base={appBase}>
        <div className="responsive-container">
          <SidebarProvider style={style as React.CSSProperties}>
          {/* Fixed Header */}
          <header className="fixed-header">
            <div className="header-left">
              <SidebarTrigger 
                data-testid="button-sidebar-toggle" 
                className="flex-shrink-0 icon-interactive modern-button rounded-xl p-2 hover:bg-accent/50" 
              />
              <img 
                src="/src/assets/clarity-logo.png" 
                alt="Clarity" 
                className="h-6 w-auto sm:h-7 md:h-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-lg hover:brightness-110 max-w-full flex-shrink-0 rounded-lg"
              />
            </div>
            <div className="header-right">
              {showSOSButton && <SOSButton />}
              <ThemeToggle />
            </div>
          </header>
          
          {/* Main Layout */}
          <div className="flex h-screen w-full main-content">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <main className="flex-1 overflow-auto p-2 xxs:p-1 sm:p-3 md:p-4 lg:p-6 pb-safe-area-bottom android-scroll">
                <RouterComponent />
              </main>
            </div>
          </div>

        </SidebarProvider>
        </div>
        </Router>
        <Toaster />
        <style>{`
          .pb-safe-area {
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
          }
        `}</style>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
