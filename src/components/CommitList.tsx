import { GitCommit, Calendar, User } from 'lucide-react';
import { Typography, Space } from 'antd';
import { GitHubCommit } from '../utils/github-search';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CommitListProps {
  commits: GitHubCommit[];
}

const CommitList = ({ commits }: CommitListProps) => {
  if (!commits || commits.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
        No commits found
      </div>
    );
  }

  const sortedCommits = commits.sort((a, b) =>
    new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  );

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <GitCommit size={16} />
        <Text strong style={{ fontSize: '14px' }}>
          Commits ({sortedCommits.length})
        </Text>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          background: 'var(--border-color)',
          zIndex: 0
        }} />

        {sortedCommits.map((commit, index) => (
          <div
            key={commit.sha}
            style={{
              position: 'relative',
              paddingLeft: '32px',
              paddingBottom: index === sortedCommits.length - 1 ? '0' : '16px',
              zIndex: 1
            }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '2px',
              top: '6px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              border: '2px solid #4D8F94',
              zIndex: 2
            }} />

            <div>
              <div style={{ marginBottom: '4px' }}>
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {commit.commit.message.split('\n')[0]}
                </a>
              </div>

              <Space size={12} style={{ fontSize: '11px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: 'var(--text-secondary)'
                }}>
                  <User size={10} />
                  {commit.author?.login || commit.commit.author.name}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: 'var(--text-secondary)'
                }}>
                  <Calendar size={10} />
                  {dayjs(commit.commit.author.date).format('MM/DD HH:mm')}
                </span>
                <span style={{
                  color: 'var(--text-tertiary)',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                }}>
                  {commit.sha.substring(0, 7)}
                </span>
              </Space>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitList;