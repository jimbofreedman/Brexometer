import React from 'react';
import { inject, observer } from 'mobx-react';
import { observable, reaction } from 'mobx';

import './styles.css';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { scaleTime } from 'd3-scale';
import LoadingIndicator from '../../LoadingIndicator';

const AnswersOverTimeAreachart = inject('AppStatisticsStore')(
  ({ AppStatisticsStore, size }) => {
    const usersStatsKey = 'user_count';
    const viewData = observable.object(
      {
        width: (size && size.width) || 400,
        height: (size && size.height) || 300,
        values: null,
      },
      {},
      { deep: false }
    );

    const data = AppStatisticsStore.advancedData.get(usersStatsKey);
    if (data) {
      const startDate = AppStatisticsStore.advancedData.get('start');
      const endDate = AppStatisticsStore.advancedData.get('end');
      viewData.values = computeLinechartData(data, startDate, endDate);
    } else {
      AppStatisticsStore.getAdvancedStatsData(usersStatsKey);
      reaction(
        () => AppStatisticsStore.advancedData.get(usersStatsKey),
        statsData => {
          const startDate = AppStatisticsStore.advancedData.get('start');
          const endDate = AppStatisticsStore.advancedData.get('end');
          viewData.values = computeLinechartData(statsData, startDate, endDate);
        }
      );
    }

    return <AnswersOverTimeAreachartView data={viewData} />;
  }
);

const AnswersOverTimeAreachartView = observer(({ data }) => (
  <div style={{ width: data.width, height: data.height }}>
    {!data.values && <LoadingIndicator />}
    {data.values && (
      <AreaChart
        width={data.width}
        height={data.height}
        data={data.values}
        className="answers-over-time-areachart"
      >
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" />
        {/* <YAxis dataKey="count" /> */}
        {/* <CartesianGrid strokeDasharray="5 5" /> */}
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3884d8"
          fillOpacity={1}
          fill="#8884d8"
        />
      </AreaChart>
    )}
  </div>
));

// ///////

const CustomTooltip = props => {
  if (props.active) {
    const { payload, label } = props;
    return (
      <div className="custom-tooltip">
        <p>{payload[0].payload.date}</p>
        <p className="value">
          <span className="bold">{payload[0].value}</span> people
        </p>
      </div>
    );
  }
  return null;
};

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
let computeLinechartData = (data, startDate, endDate) => {
  const linechartData = [];
  const scale = scaleTime()
    .domain([new Date(startDate), new Date(endDate)])
    .range([0, data.length]);
  data.map((value, i) => {
    const date = new Date(scale.invert(i));
    linechartData.push({
      count: value,
      date: `${months[date.getMonth()]} ${date.getFullYear()}`,
    });
  });
  return linechartData;
};

export default AnswersOverTimeAreachart;
