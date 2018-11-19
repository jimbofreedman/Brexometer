import React from 'react';
import { inject, observer } from 'mobx-react';
import { observable, reaction } from 'mobx';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Rectangle,
  ResponsiveContainer,
} from 'recharts';
import LoadingIndicator from '../../LoadingIndicator';

const CertanityStatisticsBarchart = inject(
  'CensusDataStore',
  'DemographicsDataStore'
)(({ CensusDataStore, DemographicsDataStore, questionId, geoId }) => {
  let certainityStatisticsArr = null;
  let currentlyShowingIndex = null;
  const viewData = observable.object(
    {
      values: null,
    },
    {},
    { deep: false }
  );

  initData((censusData, demogrData) => {
    certainityStatisticsArr = computeStatisticsData(censusData, demogrData);
    currentlyShowingIndex = getIndexToShow(certainityStatisticsArr);
    viewData.values = generateChartValues(
      certainityStatisticsArr[currentlyShowingIndex]
    );
  });

  return <CertanityStatisticsBarchartView data={viewData} />;

  function initData(cb) {
    let finishedReqCount = 0;
    let censusData = null;
    let demogrData = null;

    if (!geoId) geoId = 59;
    CensusDataStore.getCensusData(geoId).then(res => {
      if (res.results.length == 0) {
        return CensusDataStore.getCensusData(59).then(res => {
          censusData = res.results;
          finishedReqCount++;
          finish();
        });
      }
      censusData = res.results;
      finishedReqCount++;
      finish();
    });

    DemographicsDataStore.getQuestionDemographicsData({
      questionId,
      // geoId: geoId
    }).then(res => {
      demogrData = res;
      finishedReqCount++;
      finish();
    });

    let finish = () => {
      if (finishedReqCount == 2) cb(censusData, demogrData);
    };
  }
});

const BAR_BACKGROUND = '#e6e6e6';
const BAR_HEIGHT = 40;
const LABEL_FONT_SIZE = 18;

const CertanityStatisticsBarchartView = observer(({ data }) => (
  <div>
    {!data.values && <LoadingIndicator />}
    {data.values && (
      <ResponsiveContainer height={BAR_HEIGHT}>
        <BarChart
          layout="vertical"
          data={data.values}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis domain={[0, 100]} hide type="number" />
          <YAxis type="category" hide />
          <Bar
            dataKey="votes_left"
            stackId="1"
            shape={<CustomBar radius={[0, 3, 3, 0]} />}
            fill={BAR_BACKGROUND}
            radius={[3, 3, 3, 3]}
          />
          <Bar
            dataKey="x_votes"
            stackId="1"
            fill="#3b91d3"
            label={<CustomizedLabel text="X" />}
          />
          <Bar
            dataKey="f_votes"
            stackId="1"
            fill="#316e93"
            label={<CustomizedLabel text="F" />}
          />
          <Bar
            dataKey="m_votes"
            stackId="1"
            shape={<CustomBar radius={[3, 0, 0, 3]} />}
            fill="#448eb3"
            label={<CustomizedLabel text="M" />}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
));

const CustomizedLabel = props => {
  const { x, y, stroke, text, width } = props;
  return (
    <text
      x={x}
      y={y}
      dx={-width / 2 - 5}
      fill="white"
      fontSize={LABEL_FONT_SIZE}
      textAnchor="middle"
    >
      {text}
    </text>
  );
};

const CustomBar = props => {
  const { payload, x, y, width, height } = props;
  return <Rectangle {...props} />;
};

// ///////

function getIndexToShow(certainityStatisticsArr) {
  let showingIndex = null;
  for (let i = 0; i < certainityStatisticsArr.length; i++) {
    showingIndex = i;
    if (certainityStatisticsArr[i].reachedPercantage.total < 100) {
      break;
    }
  }
  return showingIndex;
}

function generateChartValues(certainityStatistics) {
  return [
    {
      m_votes: certainityStatistics.reachedPercantage.male,
      f_votes: certainityStatistics.reachedPercantage.female,
      x_votes: certainityStatistics.reachedPercantage.decline,
      votes_left:
        100 -
        (certainityStatistics.reachedPercantage.male +
          certainityStatistics.reachedPercantage.female +
          certainityStatistics.reachedPercantage.decline),
    },
  ];
}

let computeStatisticsData = (censusData, demogrData) => {
  const population = 712500000; // censusData[0].all_ages
  const showOnlyNotReached = false; // if false -> show all
  const reachedNumber = {
    total: null,
    male: null,
    female: null,
    decline: null,
  };
  let percentageOfWhoCanVote = null;
  const isNoDataError = null;
  const showingIndex = 0;
  const certainityStatistics = [
    {
      certainity: 99,
      confidenceInt: 30,
      neededNumber: null,
      remainingNumber: null,
      reachedPercantage: {
        total: 0,
        male: 0,
        female: 0,
        decline: 0,
      },
      hidden: false,
    },
  ];

  // create multiple statistics instances with different confidence level
  var i = 25;
  while (i > 0) {
    const obj = JSON.parse(JSON.stringify(certainityStatistics[0]));
    obj.confidenceInt = i;
    certainityStatistics.push(obj);
    if (i >= 20) {
      i -= 5;
    } else if (i <= 15 && i >= 7) {
      i -= 2;
    } else if (i <= 5) {
      i--;
    }
  }

  for (var i = 0; i < certainityStatistics.length; i++) {
    certainityStatistics[i].neededNumber = determineSampleSize(
      certainityStatistics[i].certainity,
      certainityStatistics[i].confidenceInt,
      population
    );
  }

  // count votes from demographics data
  const answeredSum = demogrData.total_votes;
  let answeredMaleSum = 0;
  let answeredFemaleSum = 0;
  let answeredDiscurdSum = 0;
  let canVoteSum = 0;
  for (var i = 0; i < demogrData.ageggendervalues.length; i++) {
    if (
      !!demogrData.ageggendervalues[i].id__count &&
      !!demogrData.ageggendervalues[i].age_range
    ) {
      switch (demogrData.ageggendervalues[i].user__gender) {
        case 0:
          answeredDiscurdSum += demogrData.ageggendervalues[i].id__count;
          break;
        case 1:
          answeredMaleSum += demogrData.ageggendervalues[i].id__count;
          break;
        case 2:
          answeredFemaleSum += demogrData.ageggendervalues[i].id__count;
          break;
      }

      if (demogrData.ageggendervalues[i].age_range != '<15') {
        canVoteSum += demogrData.ageggendervalues[i].id__count;
      }
    }
  }
  reachedNumber.total = answeredSum;
  reachedNumber.male = answeredMaleSum;
  reachedNumber.female = answeredFemaleSum;
  reachedNumber.decline = answeredDiscurdSum;
  percentageOfWhoCanVote = parseInt((canVoteSum * 100) / reachedNumber.total);

  // calculate percantage of answered users
  const reachedCoef = 100 / reachedNumber.total;
  for (var i = 0; i < certainityStatistics.length; i++) {
    certainityStatistics[i].reachedPercantage.total = parseInt(
      (reachedNumber.total * 100) / certainityStatistics[i].neededNumber
    );

    if (certainityStatistics[i].reachedPercantage.total > 100) {
      certainityStatistics[i].reachedPercantage.male =
        reachedNumber.male * reachedCoef;
      certainityStatistics[i].reachedPercantage.female =
        reachedNumber.female * reachedCoef;
      certainityStatistics[i].reachedPercantage.decline =
        reachedNumber.decline * reachedCoef;
    } else {
      certainityStatistics[i].reachedPercantage.male =
        (reachedNumber.male * 100) / certainityStatistics[i].neededNumber;
      certainityStatistics[i].reachedPercantage.female =
        (reachedNumber.female * 100) / certainityStatistics[i].neededNumber;
      certainityStatistics[i].reachedPercantage.decline =
        (reachedNumber.decline * 100) / certainityStatistics[i].neededNumber;
    }
  }
  return certainityStatistics;
};

function determineSampleSize(certainity, confidence, population) {
  const zValues = {
    90: 1.65,
    95: 1.96,
    99: 2.58,
  };
  const zVal = zValues[certainity];
  let ss = 0;
  if (population == 0) {
    ss = (zVal * zVal * 0.25) / ((confidence / 100) * (confidence / 100));
  } else {
    ss = (zVal * zVal * 0.25) / ((confidence / 100) * (confidence / 100));
    ss /= 1 + (ss - 1) / population;
  }
  return parseInt(ss + 0.5);
}

export default CertanityStatisticsBarchart;
