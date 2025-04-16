export function toggleDarkMode() {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
  
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
  
  export function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      window.document.documentElement.classList.add('dark');
    }
  }
  