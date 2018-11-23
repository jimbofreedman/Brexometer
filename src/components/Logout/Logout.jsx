import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import { Redirect } from 'react-router'

@inject("authStore", "routing")
@observer
export default class Logout extends Component {
  componentDidMount() {
    const { authStore, routing } = this.props;
    authStore.logout();
  }

  render() {
    return <Redirect to="/" />
  }
}
