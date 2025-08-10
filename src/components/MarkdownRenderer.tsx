import MarkdownPreview from '@uiw/react-markdown-preview';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    // Check current theme from CSS variable
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  const cleanContent = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      padding: '12px',
      marginTop: '8px',
      fontSize: '13px',
      lineHeight: '1.5',
      color: 'var(--text-primary)',
    }}>
      <MarkdownPreview
        source={cleanContent}
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
          fontSize: '13px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
        wrapperElement={{
          "data-color-mode": theme
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;