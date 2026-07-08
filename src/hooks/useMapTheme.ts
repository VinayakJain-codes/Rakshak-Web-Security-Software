import { useTheme } from '../providers/ThemeProvider';

export function useMapTheme() {
  const { theme } = useTheme();
  
  // Return corresponding Mapbox style URL based on active theme
  return theme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';
}
