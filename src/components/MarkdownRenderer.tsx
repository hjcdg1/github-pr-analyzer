import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
              marginTop: '16px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '6px'
            }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              marginTop: '14px'
            }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{
              fontSize: '15px',
              fontWeight: 'bold',
              marginBottom: '8px',
              marginTop: '12px'
            }}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p style={{
              marginBottom: '12px',
              lineHeight: '1.6'
            }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul style={{
              marginBottom: '12px',
              paddingLeft: '20px'
            }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{
              marginBottom: '12px',
              paddingLeft: '20px'
            }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{
              marginBottom: '4px'
            }}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '3px solid var(--border-color)',
              paddingLeft: '12px',
              margin: '12px 0',
              fontStyle: 'italic',
              color: 'var(--text-secondary)'
            }}>
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');

            if (isBlock) {
              return (
                <pre style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '8px',
                  margin: '8px 0',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  <code>{children}</code>
                </pre>
              );
            }

            return (
              <code style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                padding: '2px 4px',
                fontSize: '12px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace'
              }}>
                {children}
              </code>
            );
          },
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1890ff',
                textDecoration: 'underline'
              }}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '12px 0',
              fontSize: '12px'
            }}>
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th style={{
              border: '1px solid var(--border-color)',
              padding: '6px 8px',
              background: 'var(--bg-secondary)',
              fontWeight: 'bold',
              textAlign: 'left'
            }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{
              border: '1px solid var(--border-color)',
              padding: '6px 8px'
            }}>
              {children}
            </td>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;