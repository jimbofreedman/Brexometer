import { observable, autorun, observe } from 'mobx';
import Cookies from 'cookies-js';
import GeoService from '../services/GeoService'

class UserStore {

  userData = observable.map({}, { deep: false });
  sessionData = observable.map(
    {
      authToken: "",
      showUserDialog: false,
    },
    { deep: false}
  );

  userLocation = observable.map({
    pathname: window.location.pathname
  }, { deep: false });

  updateAxios = observe(this.sessionData, "authToken", (change) => {
    if(change.newValue) {
      window.API.defaults.headers.common['Authorization'] = "Token " + change.newValue;
    }else {
      delete window.API.defaults.headers.common['Authorization'];
    }
  });

  constructor() {

    if (Cookies.enabled) { // Check if browser allows cookies and if so attempt auto-login
      let authToken = Cookies.get('representAuthToken'); // Check if cookie exists with authToken
      this.sessionData.set("authToken", authToken);
      this.getMe();
    }

    window.API.interceptors.response.use(function (response) { // On successful response
        return response;
      }, function (error) { // On error response
        if(401 === error.response.status) { // Server returned 401
          console.log("Logging out");
          this.logout();
        }
        return Promise.reject(error);
      }.bind(this));

    this.logout = this.logout.bind(this);
    this.onAuthLoginSuccess = this.onAuthLoginSuccess.bind(this);
  }

  getMe() {
    console.log("===== GET ME")
    return new Promise((resolve, reject) => {
      if(!this.sessionData.get("authToken")) {
        console.log("No auth token");
        reject("No auth token");
      }

      window.API.get('/auth/me/')
        .then((response) => {
          console.log("SUCCESS");
          console.log(response);
          this.userData.replace(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.log("FAILURE");
          console.log(error);
          reject(error)
        })
    });

  }

  setupAuthToken(authToken) {
    console.log("=============== setupAuthToken")
    return new Promise((resolve, reject) => {
      this.sessionData.set("authToken", authToken);
      Cookies.set("representAuthToken", authToken, { expires: Infinity });
      window.API.defaults.headers.common['Authorization'] = "Token " + authToken;
      this.getMe()
        .then((response) => {
          console.log("Getme response:")
          console.log(response);
          resolve(response)
        })
        .catch((error) => {
          console.log(error);
          reject(error)
        })
    });
  }

  getAuthToken() {
    return this.sessionData.get("authToken") || false;
  }

  authYeti(provider, access_token) {
    window.API.post('/auth-yeti/', { provider, access_token })
      .then(function (response) {
        if(response.data.auth_token && response.data.id) {
          this.setupAuthToken(response.data.auth_token);
        }
      }.bind(this));
  }

  authLogin(username, password) {
    return window.API.post('/auth/login/', { username, password })
      .then(this.onAuthLoginSuccess);
  }

  onAuthLoginSuccess(response) {
    if(response.data.auth_token) {
      this.setupAuthToken(response.data.auth_token);
    }
  }

  toggleUserDialog() {
    this.sessionData.set("showUserDialog", !this.sessionData.get("showUserDialog"));
  }

  register(details) {

    return new Promise((resolve, reject) => { // Return a promise of search results

      if(details.postcode) {
        GeoService.checkPostcode(details.postcode)
          .then((response) => {

            if(response.data.status === "OK") {
              let raw_location = response.data.results[0].geometry.location;
              location =  {
                "type": "Point",
                "coordinates": [raw_location.lng, raw_location.lat]
              };
            }

          })

      }

    })

  }


  logout() {
    console.log("======== LOGGING OUT")
    console.log("Userdata is now:")
    console.log(this.userData);
    console.log(this.userData.size);
    console.log(this.userData.get("id"));
    console.log("Performing logout...")
    Cookies.expire("representAuthToken");
    this.sessionData.set("authToken", "");
    this.userData.clear();
    this.sessionData.set("showUserDialogue", false);
    //location.reload();
    console.log("Userdata is now:")
    console.log(this.userData);
    console.log(this.userData.size);
    console.log(this.userData.get("id"));
  }

  isLoggedIn() {
    console.log("==== ISLOGGEDIN");
    const ret = this.userData.get('id');
    console.log(ret);
    return ret;
  }

  compareUsers(userAId, userBId) {
    return window.API.get('/api/compare_users/?usera='+userAId+'&userb='+userBId)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error, error.response.data);
      });
  }

  getUserById(id) {
    return window.API.get('/api/users/' + id + '/')
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error, error.response.data);
      });
  }

  checkEmail(email) {

    return new Promise((resolve, reject) => { // Return a promise of search results
      window.API.get('/auth/check_email/?email=' + email)
        .then((response) => {
          resolve(response.data.result)
        })
        .catch((error) => {
          console.log(error)
        })
      })
  }

  checkEmailRegex(email) {
    if(!RegExp("[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?").test(email)) {
      return false
    }
    return true
  }

}

autorun(() => {
  //window.API.defaults.headers.common['Authorization'] = "Token ff76bcf5e0daf737144f34fcd913a6cd13c96df2";
})

export default UserStore;
