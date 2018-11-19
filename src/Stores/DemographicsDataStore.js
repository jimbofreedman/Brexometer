import { observable, autorun } from 'mobx';

class DemographicsDataStore {

    usersDemographicsData = observable.map({}, { deep: false });
    questionDemographicsData = observable.map({}, { deep: false });
    questionWeightedAgeData = observable.map({}, { deep: false });
    questionWeightedGeoData = observable.map({}, { deep: false });

    getUsersDemographicsData(geoId) {
        let reqStr = '/api/users/demographics/';
        if (geoId) reqStr += '?locations__geo='+geoId;
        return window.API.get(reqStr)
            .then((response) => {
                this.usersDemographicsData.set(geoId, response.data);
                return response.data;
            });
    }

    getQuestionDemographicsData(data) {
        var reqArr = [
            'question='+data.questionId
        ];
        if (data.groupId) {
            reqArr.push('user__group_memberships__group='+data.groupId);
        }
        if (data.geoId) {
            reqArr.push('user__locations__geo=' + data.geoId);
        }
        return window.API.get('/api/question_demographics/?' + reqArr.join('&'))
            .then((response) => {
                this.questionDemographicsData.set(data.questionId, response.data);
                return response.data;
            });
    }

    getWeightedQuestionAverageDataByAge(question_id) {
      if(this.questionWeightedAgeData.has(question_id)) {
        return this.questionWeightedAgeData.get(question_id);
      }

      return window.API.get('/api/question_weighted_demographics/' + question_id + '/age/')
          .then((response) => {
            this.questionWeightedAgeData.set(response.data.qid, response.data.data);
            return response.data.data;
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
    }

    getWeightedQuestionAverageDataByGeo(question_id, minAge = 0, maxAge = 200) {
      if(this.questionWeightedGeoData.has(question_id)) {
        return this.questionWeightedGeoData.get(question_id);
      }

      return window.API.get('/api/question_weighted_demographics/' + question_id + '/area/?voter_age__gte=' + minAge + '&voter_age__lte=' + maxAge)
          .then((response) => {
            this.questionWeightedGeoData.set(response.data.qid, response.data.data);
            return response.data.data;
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
    }

}

export default DemographicsDataStore;
