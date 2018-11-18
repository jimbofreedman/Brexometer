import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import { Redirect } from 'react-router'

@inject("UserStore", "routing")
@observer
export default class Logout extends Component {
  componentDidMount() {
    const { UserStore, routing } = this.props;
    console.log("===CDM");
    console.log(UserStore.userData);
    console.log(UserStore.userData.size);
    console.log(UserStore.userData.get("id"));
    UserStore.logout();
    //routing.push("/");
  }

  render() {
    return <Redirect to="/" />
  }
}
