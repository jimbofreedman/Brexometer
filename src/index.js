import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { observable } from 'mobx';
import axios from 'axios';
import createBrowserHistory from 'history/createBrowserHistory';
import createMemoryHistory from 'history/createMemoryHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';

/* STORES */
import ReactGA from 'react-ga';
import commonStore from './stores/CommonStore';
import authStore from './stores/AuthStore.js';
import CollectionStore from './stores/CollectionStore.js';
import QuestionStore from './stores/QuestionStore.js';
import DemographicsDataStore from './stores/DemographicsDataStore.js';
import CensusDataStore from './stores/CensusDataStore.js';
import AppStatisticsStore from './stores/AppStatisticsStore.js';
import Shell from './components/Shell';

ReactGA.initialize('UA-59994709-1', {
  debug: true,
  titleCase: false,
});

window.authSettings = {
  facebookPageId: 1522822621304793,
  // facebookId: 1499361770335561,
  facebookId: 1499361770335561,
  googleMapsAPI: 'AIzaSyDZxI6243Bb460yabWL_tyN97NBH6hsnwo',
};

if (location.host === 'open.represent.me') {
  // Test server override defaults
  window.authSettings.facebookId = 1499361770335561;
  window.API = axios.create({
    baseURL: 'https://api.represent.me',
  });
} else if (
  location.host === 'share-test.represent.me' ||
  location.host === 'test.represent.me'
) {
  // Test server override defaults
  window.authSettings.facebookId = 1684727181799018;
  window.API = axios.create({
    baseURL: 'https://test.represent.me',
  });
} else {
  window.API = axios.create({
    // baseURL: 'http://localhost:8000'
    baseURL: 'http://api.represent.me',
  });
}

const routing = new RouterStore();

window.stores = {
  CollectionStore: new CollectionStore(),
  QuestionStore: new QuestionStore(),
  DemographicsDataStore: new DemographicsDataStore(),
  CensusDataStore: new CensusDataStore(),
  AppStatisticsStore: new AppStatisticsStore(),
  routing,
};

window.REPRESENT = (element, initialPath = '/', virtualLocation = true) => {
  let history;

  const stores = {
    commonStore,
    authStore,
    CollectionStore: window.stores.CollectionStore,
    QuestionStore: window.stores.QuestionStore,
    DemographicsDataStore: window.stores.DemographicsDataStore,
    CensusDataStore: window.stores.CensusDataStore,
    AppStatisticsStore: window.stores.AppStatisticsStore,
    routing: window.stores.routing
  };

  if (virtualLocation) {
    history = createMemoryHistory({
      initialEntries: [initialPath],
    });
  } else {
    history = syncHistoryWithStore(createBrowserHistory(), routing);
    // history = createBrowserHistory();
    history.listen((location, action) => {
      console.log('location, action', location, action);
      ReactGA.set({ page: location.pathname });
      ReactGA.pageview(location.pathname);
    });
  }


  ReactDOM.render(
    <div>
      <Provider {...stores}>
        <Shell history={history} />
      </Provider>
    </div>,
    document.getElementById(element)
  );
};

window.REPRESENTREADY();
