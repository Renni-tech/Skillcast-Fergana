import Home from '@/app/page';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Light is the default for first visits and for anyone who has not chosen a
// theme. An explicit choice from the header switch is saved by next-themes
// ("theme" in localStorage) and is respected on later visits.
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider>
        <Home />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
