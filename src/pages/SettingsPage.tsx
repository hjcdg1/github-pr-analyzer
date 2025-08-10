import { useState } from 'react';
import { Form, Input, Select, Button, Card, Space, Typography, App } from 'antd';
import { Save, Moon, Sun, Monitor } from 'lucide-react';
import { Settings } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsPageProps {
  settings: Settings;
  updateSettings: (settings: Settings) => void;
}

const SettingsPage = ({ settings, updateSettings }: SettingsPageProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const newSettings: Settings = {
        githubToken: values.githubToken,
        theme: values.theme,
      };

      await updateSettings(newSettings);
      message.success('Settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Title level={2}>Settings</Title>

      <Card title="GitHub Configuration" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            githubToken: settings.githubToken || '',
            theme: settings.theme || 'system',
          }}
        >
          <Form.Item
            label="GitHub Personal Access Token"
            name="githubToken"
            rules={[
              { required: true, message: 'Please enter your GitHub token' },
              { min: 40, message: 'GitHub token should be at least 40 characters' },
            ]}
            extra={
              <Text type="secondary">
                You can create a personal access token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Settings
                </a>
                . Make sure to grant 'repo' scope.
              </Text>
            }
          >
            <Input.Password
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              size="large"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Appearance" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Theme"
            name="theme"
            extra="Choose your preferred color theme"
          >
            <Select size="large" style={{ width: '100%' }}>
              <Option value="system">
                <Space>
                  <Monitor size={16} />
                  System
                </Space>
              </Option>
              <Option value="light">
                <Space>
                  <Sun size={16} />
                  Light
                </Space>
              </Option>
              <Option value="dark">
                <Space>
                  <Moon size={16} />
                  Dark
                </Space>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Button
        type="primary"
        size="large"
        icon={<Save size={16} />}
        onClick={handleSave}
        loading={loading}
      >
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsPage;