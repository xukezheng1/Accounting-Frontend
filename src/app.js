import { useEffect } from 'react';
import { applyThemeUI, getThemePreference, resolveTheme } from './services/theme';
import './app.scss';

function App({ children }) {
  useEffect(() => {
    applyThemeUI(resolveTheme(getThemePreference()));
  }, []);

  return children;
}

export default App;