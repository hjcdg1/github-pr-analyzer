import { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Divider,
  Pagination,
  Empty,
  Select,
  Modal,
  App
} from 'antd';
import {
  Search,
  CheckCircle,
  AlertCircle,
  GitPullRequest,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { TabData, Settings } from '../types';
import { GitHubSearchAPI } from '../utils/github-search';
import PRChart from '../components/PRChart';
import MarkdownRenderer from '../components/MarkdownRenderer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AnalyzePageProps {
  settings: Settings;
}

const AnalyzePage = ({ settings }: AnalyzePageProps) => {
  const { message } = App.useApp();
  const [tabs, setTabs] = useState<TabData[]>([
    {
      id: '1',
      name: 'Analysis 1',
      repoUrl: '',
      headBranch: '',
      baseBranch: '',
      startDate: null,
      endDate: null,
      usernames: [],
    },
  ]);
  const [activeKey, setActiveKey] = useState('1');
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: 'idle' | 'testing' | 'success' | 'error' }>({});
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; body: string }>({ title: '', body: '' });

  const loadAnalysisData = useCallback(async () => {
    if (window.electronAPI) {
      try {
        const analysisData = await window.electronAPI.getAnalysisData();

        if (analysisData && analysisData.tabs) {
          const restoredTabs = analysisData.tabs.map((tab: any, index: number) => ({
            ...tab,
            name: tab.name || `Analysis ${index + 1}`,
            startDate: tab.startDate ? new Date(tab.startDate) : null,
            endDate: tab.endDate ? new Date(tab.endDate) : null,
            loading: false,
          }));
          setTabs(restoredTabs);

          if (analysisData.activeKey) {
            setActiveKey(analysisData.activeKey);
          }
          if (analysisData.currentPage) {
            setCurrentPage(analysisData.currentPage);
          }
        }
      } catch (error) {
        // Error loading analysis data
      }
    }
  }, []);

  const saveAnalysisData = useCallback(async () => {
    if (window.electronAPI && tabs.length > 0) {
      try {
        const analysisData = {
          tabs: tabs.map(tab => ({
            ...tab,
            loading: false,
            error: undefined,
          })),
          activeKey,
          currentPage,
        };
        await window.electronAPI.saveAnalysisData(analysisData);
      } catch (error) {
        // Error saving analysis data
      }
    }
  }, [tabs, activeKey, currentPage]);

  useEffect(() => {
    loadAnalysisData();
  }, [loadAnalysisData]);

  useEffect(() => {
    saveAnalysisData();
  }, [saveAnalysisData]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const handleAddTab = () => {
    const newTabIndex = tabs.length + 1;
    const newTab: TabData = {
      id: Date.now().toString(),
      name: `Analysis ${newTabIndex}`,
      repoUrl: '',
      headBranch: '',
      baseBranch: '',
      startDate: null,
      endDate: null,
      usernames: [],
    };
    setTabs([...tabs, newTab]);
    setActiveKey(newTab.id);
  };

  const handleRemoveTab = (targetKey: string) => {
    const newTabs = tabs.filter(tab => tab.id !== targetKey);
    if (newTabs.length === 0) {
      newTabs.push({
        id: Date.now().toString(),
        name: 'Analysis 1',
        repoUrl: '',
        headBranch: '',
        baseBranch: '',
        startDate: null,
        endDate: null,
        usernames: [],
      });
    }
    setTabs(newTabs);
    if (activeKey === targetKey) {
      setActiveKey(newTabs[newTabs.length - 1].id);
    }
  };

  const updateTab = (tabId: string, updates: Partial<TabData>) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  const testConnection = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.repoUrl) {
      message.error('Please enter a repository URL');
      return;
    }

    if (!settings.githubToken) {
      message.error('Please configure your GitHub token in Settings');
      return;
    }

    setConnectionStatus({ ...connectionStatus, [tabId]: 'testing' });

    try {
      const api = new GitHubSearchAPI(settings.githubToken);
      const success = await api.testConnection(tab.repoUrl);

      if (success) {
        setConnectionStatus({ ...connectionStatus, [tabId]: 'success' });
        message.success('Connection successful!');
      } else {
        setConnectionStatus({ ...connectionStatus, [tabId]: 'error' });
        message.error('Failed to connect to repository');
      }
    } catch (error) {
      setConnectionStatus({ ...connectionStatus, [tabId]: 'error' });
      message.error('Connection test failed');
    }
  };

  const analyzePRs = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (!settings.githubToken) {
      message.error('Please configure your GitHub token in Settings');
      return;
    }

    if (!tab.repoUrl || !tab.baseBranch || !tab.startDate || !tab.endDate || tab.usernames.length === 0) {
      message.error('Please fill in all required fields');
      return;
    }

    updateTab(tabId, { loading: true, error: undefined });

    try {
      const api = new GitHubSearchAPI(settings.githubToken);
      const prs = await api.fetchPRs(
        tab.repoUrl,
        tab.headBranch,
        tab.baseBranch,
        tab.startDate,
        tab.endDate,
        tab.usernames
      );

      updateTab(tabId, {
        prs: prs,
        loading: false
      });
      setCurrentPage({ ...currentPage, [tabId]: 1 });
      message.success(`Found ${prs.length} PRs`);
    } catch (error: any) {
      updateTab(tabId, {
        loading: false,
        error: error.message || 'Failed to fetch PRs'
      });
      message.error('Failed to analyze PRs');
    }
  };

  const renderTabContent = (tab: TabData) => {
    const status = connectionStatus[tab.id] || 'idle';
    const currentPageNum = currentPage[tab.id] || 1;
    const startIndex = (currentPageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPRs = tab.prs?.slice(startIndex, endIndex);

    return (
      <div>
        <Card className="form-section">
          <Form layout="vertical">
            <Form.Item
              label="Tab Name"
              extra="Customize the name for this analysis tab"
            >
              <Input
                placeholder="Enter tab name"
                value={tab.name}
                onChange={(e) => updateTab(tab.id, { name: e.target.value })}
                style={{ maxWidth: '300px' }}
              />
            </Form.Item>

            <Form.Item
              label="GitHub Repository URL"
              required
              extra="Enter the full GitHub repository URL (e.g., https://github.com/owner/repo)"
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="https://github.com/owner/repository"
                  value={tab.repoUrl}
                  onChange={(e) => updateTab(tab.id, { repoUrl: e.target.value })}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => testConnection(tab.id)}
                  loading={status === 'testing'}
                  icon={
                    status === 'success' ? <CheckCircle size={16} /> :
                      status === 'error' ? <AlertCircle size={16} /> :
                        <Search size={16} />
                  }
                  type={status === 'success' ? 'primary' : 'default'}
                >
                  Connection Test
                </Button>
              </Space.Compact>
            </Form.Item>

            <Space style={{ width: '100%', alignItems: 'flex-start' }} size="large">
              <Form.Item
                label="Head Branch"
                style={{ flex: 1 }}
                extra="Leave empty to include all branches"
              >
                <Input
                  placeholder="feature/branch-name (optional)"
                  value={tab.headBranch}
                  onChange={(e) => updateTab(tab.id, { headBranch: e.target.value })}
                />
              </Form.Item>

              <Form.Item
                label="Base Branch"
                required
                style={{ flex: 1 }}
                extra=" "
              >
                <Input
                  placeholder="main or master"
                  value={tab.baseBranch}
                  onChange={(e) => updateTab(tab.id, { baseBranch: e.target.value })}
                />
              </Form.Item>
            </Space>

            <Form.Item
              label="Analysis Period"
              required
              extra="Select the date range for PR analysis (max 1 year)"
            >
              <RangePicker
                style={{ width: '100%' }}
                value={
                  tab.startDate && tab.endDate
                    ? [dayjs(tab.startDate), dayjs(tab.endDate)]
                    : null
                }
                onChange={(dates) => {
                  if (dates) {
                    const [start, end] = dates;
                    if (start && end) {
                      const diffInDays = end.diff(start, 'days');
                      if (diffInDays > 365) {
                        message.error('Date range cannot exceed 1 year');
                        return;
                      }
                      updateTab(tab.id, {
                        startDate: start.toDate(),
                        endDate: end.toDate()
                      });
                    }
                  } else {
                    updateTab(tab.id, { startDate: null, endDate: null });
                  }
                }}
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
              />
            </Form.Item>

            <Form.Item
              label="GitHub Usernames"
              required
              extra="Enter GitHub usernames to filter commits (you can add multiple)"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Enter usernames and press Enter"
                value={tab.usernames}
                onChange={(values) => updateTab(tab.id, { usernames: values })}
              />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              onClick={() => analyzePRs(tab.id)}
              loading={tab.loading}
              icon={<Search size={16} />}
              disabled={!tab.repoUrl || !tab.baseBranch || !tab.startDate || !tab.endDate || tab.usernames.length === 0}
            >
              {tab.prs ? 'Re-analyze' : 'Analyze'}
            </Button>
          </Form>
        </Card>

        {tab.prs && (
          <>
            <Divider />

            {tab.prs.length > 0 ? (
              <>
                <PRChart prs={tab.prs} />

                <Card className="pr-list" title={`Pull Requests (${tab.prs.length} total)`}>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={pageSize}
                      onChange={setPageSize}
                      style={{ width: 120 }}
                    >
                      <Select.Option value={10}>10 per page</Select.Option>
                      <Select.Option value={50}>50 per page</Select.Option>
                      <Select.Option value={100}>100 per page</Select.Option>
                    </Select>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {paginatedPRs?.map((pr) => (
                      <div key={pr.id} className="pr-item">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                              <GitPullRequest size={14} />
                              <Text strong style={{ fontSize: '14px' }}>
                                <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                                  #{pr.number}
                                </a>
                              </Text>
                            </Space>
                            <Space size={6} wrap>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 6px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)'
                              }}>
                                <Calendar size={10} />
                                {dayjs(pr.merged_at).format('MM/DD HH:mm')}
                              </span>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 6px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)'
                              }}>
                                <User size={10} />
                                {pr.user?.login || 'Unknown'}
                              </span>
                            </Space>
                          </Space>
                          <div style={{
                            fontSize: '13px',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            <a
                              href={pr.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                              {pr.title}
                            </a>
                          </div>
                          {pr.body && (
                            <Button
                              size="small"
                              icon={<Eye size={12} />}
                              onClick={() => {
                                setModalContent({
                                  title: `PR #${pr.number}: ${pr.title}`,
                                  body: pr.body || ''
                                });
                                setModalVisible(true);
                              }}
                              style={{
                                fontSize: '11px',
                                height: '24px',
                                padding: '0 8px'
                              }}
                            >
                              View Description
                            </Button>
                          )}
                        </Space>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    current={currentPageNum}
                    total={tab.prs.length}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage({ ...currentPage, [tab.id]: page })}
                    showTotal={(total) => `Total ${total} PRs`}
                    style={{ marginTop: 16, textAlign: 'center' }}
                  />
                </Card>
              </>
            ) : (
              <Empty description="No PRs found matching your criteria" />
            )}
          </>
        )}

        {tab.loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large">
              <div style={{ marginTop: 8 }}>Analyzing PRs...</div>
            </Spin>
          </div>
        )}

        {tab.error && (
          <Card style={{ marginTop: 24 }}>
            <Text type="danger">{tab.error}</Text>
          </Card>
        )}

        <Modal
          title={modalContent.title}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
          centered
        >
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <MarkdownRenderer content={modalContent.body} />
          </div>
        </Modal>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Title level={2}>Analyze Pull Requests</Title>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        type="editable-card"
        onEdit={(targetKey, action) => {
          if (action === 'add') {
            handleAddTab();
          } else if (action === 'remove' && typeof targetKey === 'string') {
            handleRemoveTab(targetKey);
          }
        }}
        items={tabs.map((tab) => ({
          key: tab.id,
          label: tab.name,
          children: renderTabContent(tab),
        }))}
      />
    </div>
  );
};

export default AnalyzePage;