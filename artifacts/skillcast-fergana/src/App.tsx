import Home from '@/app/page';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Home />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
