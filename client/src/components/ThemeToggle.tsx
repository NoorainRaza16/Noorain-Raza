import React from 'react';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    console.log('[ThemeToggle] Current theme before toggle:', theme);
    // Always toggle between light and dark, ignoring system
    // This avoids the "system" state which can be confusing to users
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('[ThemeToggle] Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
    >
      {theme === "dark" ? (
        <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </Button>
  );
}

export default ThemeToggle;