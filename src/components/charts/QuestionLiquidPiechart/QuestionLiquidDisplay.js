import React from 'react';

import QuestionLiquidPiechart from './QuestionLiquidPiechart'
import CollectionSharingLinks from '../CollectionCharts/CollectionSharingLinks';

const QuestionLiquidDisplay = (props) => {
  return (
    <div>
      <QuestionLiquidPiechart questionId={parseInt(props.match.params.questionId, 10)}/>
      <CollectionSharingLinks />
    </div>
  )
}

export default QuestionLiquidDisplay;
