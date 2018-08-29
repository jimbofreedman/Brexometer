import React from 'react';
import { inject } from "mobx-react";

import QuestionWeightedAverageGeoChart from '../charts/QuestionWeightedAverageGeoChart';

const UndividedRender = inject("QuestionStore")(({ QuestionStore, match }) => {
    return (
        <div>
            <QuestionWeightedAverageGeoChart questionId={match.params.questionId} bucketSize={2} startAge={13} endAge={30}/>
        </div>
    )
})

export default UndividedRender;
