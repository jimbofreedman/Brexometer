import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import DynamicConfigService from '../../services/DynamicConfigService';

@inject('authStore')
@observer
class AuthTokenComponent extends Component {
  componentWillMount() {
    const authtoken = this.props.match.params.authtoken;

    this.dynamicConfig = DynamicConfigService;
    if (this.props.match.params.dynamicConfig) {
      this.dynamicConfig.setConfigFromRaw(
        this.props.match.params.dynamicConfig
      );
    }

    this.props.authStore.setupAuthToken(authtoken)
      .then(response => {
        this.props.history.push(this.dynamicConfig.getNextRedirect());
      })
      .catch(error => {
        console.log(error);
        // props.history.push("/login/" + props.match.params.redirect);
      });
  }

  render() {
    return <p>Loading...</p>;
  }
}

export default AuthTokenComponent;
