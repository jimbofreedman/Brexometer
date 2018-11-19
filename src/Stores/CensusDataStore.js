import { observable, autorun } from 'mobx';

class CensusDataStore {
  censusData = observable.map({}, { deep: false });

  // use this in case you need to preload data
  // @returns promise
  loadCensusData(geoId) {
    let reqStr = '/api/census_data/';
    if (geoId) reqStr += `?geo=${geoId}`;
    return window.API.get(reqStr).then(response => {
      this.censusData.set(geoId, response.data);
    });
  }

  // use this to get data
  // @returns promise
  getCensusData(geoId) {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.censusData[geoId]) return resolve(self.censusData.get(geoId));

      self.loadCensusData(geoId).then(() => {
        resolve(self.censusData.get(geoId));
      });
    });
  }
}

export default CensusDataStore;
