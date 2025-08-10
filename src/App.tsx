import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { BarChart3, Settings as SettingsIcon } from 'lucide-react';
import AnalyzePage from './pages/AnalyzePage';
import SettingsPage from './pages/SettingsPage';
import { Settings } from './types';

declare global {
  interface Window {
    electronAPI: {
      getTheme: () => Promise<string>;
      setTheme: (theme: string) => Promise<string>;
      getSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<boolean>;
      getAnalysisData: () => Promise<any>;
      saveAnalysisData: (analysisData: any) => Promise<boolean>;
    };
  }
}

function App() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.theme) {
      applyTheme();
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [settings.theme]);

  const loadSettings = async () => {
    if (window.electronAPI) {
      const savedSettings = await window.electronAPI.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    }
  };

  const applyTheme = async () => {
    let themeToApply: 'light' | 'dark' = 'light';

    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDark ? 'dark' : 'light';
      if (window.electronAPI) {
        await window.electronAPI.setTheme('system');
      }
    } else {
      themeToApply = settings.theme as 'light' | 'dark';
      if (window.electronAPI) {
        await window.electronAPI.setTheme(settings.theme);
      }
    }

    setCurrentTheme(themeToApply);
    document.documentElement.setAttribute('data-theme', themeToApply);
  };

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(newSettings);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntdApp>
        <Router>
          <div className="app">
            <nav className="sidebar">
              <NavLink
                to="/"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <BarChart3 size={20} />
                <span>Analyze</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <SettingsIcon size={20} />
                <span>Settings</span>
              </NavLink>
            </nav>
            <main className="content">
              <Routes>
                <Route path="/" element={<AnalyzePage settings={settings} />} />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      settings={settings}
                      updateSettings={updateSettings}
                    />
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;