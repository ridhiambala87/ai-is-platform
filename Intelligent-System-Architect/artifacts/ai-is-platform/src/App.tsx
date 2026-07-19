import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Architecture } from './pages/Architecture';
import { Techniques } from './pages/Techniques';
import { Performance } from './pages/Performance';
import { Research } from './pages/Research';
import { Formulas } from './pages/Formulas';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MLPlayground from './pages/MLPlayground';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* 1. Pehle page ko ensure karein ki wahi dashboard overview hai */}
      <Route path="/" component={Home} /> 
      <Route path="/architecture" component={Architecture} />
      <Route path="/techniques" component={Techniques} />
      <Route path="/performance" component={Performance} />
      <Route path="/research" component={Research} />
      <Route path="/formulas" component={Formulas} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/ml-playground" component={MLPlayground} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Strict absolute single slash root enforce karein */}
          <WouterRouter base="/">
            <div className="flex flex-col min-h-screen w-full relative">
              <Navbar />
              <main className="flex-1 w-full">
                <Router />
              </main>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
