import React from 'react';
import { observer } from "mobx-react";
import {PieChart, Pie, Tooltip, ResponsiveContainer} from 'recharts';
import LoadingIndicator from '../../LoadingIndicator';

const PIE_HEIGHT = 300;

const CustomTooltip = (props) => {
  const { active } = props;
  if (active) {
    const { payload } = props;
    return (
      <div style={{  opacity: 0.8, padding: 5, borderRadius: 5}}>
        <p>{`${payload[0].payload.direct_vote_count} people`}</p>
      </div>
    );
  }
  return null;
};


const OneLevelPiechartComponent = observer(({data}) => {

  const RADIAN = Math.PI / 180;
  const CX = '50%';
  const CY = 125;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, prev, outerRadius, value, fill, payload, percent, index, data_length }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.45;
    const x  = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy  + radius * Math.sin(-midAngle * RADIAN);


    return (
      <text x={x} y={prev < 3 ? y+16-8*index : y} fill={fill} style={{fontSize: 14}} textAnchor={x > cx ? 'start' : 'end'} 	dominantBaseline="text-after-edge">
        {/* <foreignObject x={x} y={y} width="80" height="100" textAnchor="middle" style={{fontSize: 10, fill: 'grey'}}	dominantBaseline="central">
          <p xmlns="http://www.w3.org/1999/xhtml">{`${payload.name}: ${(percent * 100).toFixed(0)}%`}</p>
        </foreignObject> */}
        {`${payload.name}: ${(percent * 100).toFixed(0)}%`}
      </text>
      );
    };

	return (
    <div>
      {!data && <LoadingIndicator />}
      {data && <ResponsiveContainer width="100%" height="100%" minHeight={PIE_HEIGHT}>
      	<PieChart
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>

          <Pie
            data={data.values}
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={40}
            outerRadius={80}
            fill="#8884d8"
            cx={CX}
            cy={CY}
          >
          </Pie>
          <Tooltip coordinate={{ x: 100, y: 140 }} content={<CustomTooltip/>}/>
          {/* <Legend width={PIE_WIDTH} align='left' wrapperStyle={{ bottom: 10, left: 10, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '30px', padding: 10}} /> */}

        </PieChart>

      </ResponsiveContainer>}
    </div>
    );
  })
export default OneLevelPiechartComponent;
