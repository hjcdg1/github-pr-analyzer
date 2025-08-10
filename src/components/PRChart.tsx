import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from 'antd';
import { format, parseISO, startOfWeek } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { GitHubPR } from '../utils/github-search';

interface PRChartProps {
  prs: GitHubPR[];
}

const PRChart = ({ prs }: PRChartProps) => {
  const getPRsByWeek = () => {
    const prsByWeek: { [key: string]: number } = {};

    prs.forEach(pr => {
      if (!pr.merged_at) return;

      const mergedDate = parseISO(pr.merged_at);
      const koreanDate = toZonedTime(mergedDate, 'Asia/Seoul');
      const weekStart = startOfWeek(koreanDate, { weekStartsOn: 1 }); // 월요일부터 시작
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!prsByWeek[weekKey]) {
        prsByWeek[weekKey] = 0;
      }
      prsByWeek[weekKey]++;
    });

    const sortedWeeks = Object.keys(prsByWeek).sort();

    if (sortedWeeks.length > 0) {
      const startWeek = new Date(sortedWeeks[0]);
      const endWeek = new Date(sortedWeeks[sortedWeeks.length - 1]);

      for (let w = new Date(startWeek); w <= endWeek; w.setDate(w.getDate() + 7)) {
        const weekKey = format(w, 'yyyy-MM-dd');
        if (!prsByWeek[weekKey]) {
          prsByWeek[weekKey] = 0;
        }
      }
    }

    return prsByWeek;
  };

  const prsByWeek = getPRsByWeek();
  const sortedWeeks = Object.keys(prsByWeek).sort();

  const data = {
    labels: sortedWeeks.map(week => {
      const weekStart = parseISO(week);
      return format(weekStart, 'MM/dd') + ' ~';
    }),
    datasets: [
      {
        label: 'Number of PRs',
        data: sortedWeeks.map(week => prsByWeek[week]),
        backgroundColor: 'rgba(77, 143, 148, 0.6)',
        borderColor: 'rgba(77, 143, 148, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2.5,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Pull Requests Timeline',
        padding: {
          top: 5,
          bottom: 15,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const weekStart = parseISO(sortedWeeks[index]);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return `Week: ${format(weekStart, 'MM/dd')} - ${format(weekEnd, 'MM/dd')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 5,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          padding: 5,
        },
      },
    },
  };

  return (
    <Card className="chart-container">
      <div style={{ height: '350px' }}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default PRChart;