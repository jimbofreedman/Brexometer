import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import FacebookLogin from 'react-facebook-login';
import { Redirect } from 'react-router-dom';
import MobxReactForm from 'mobx-react-form';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import FormLabel from '@material-ui/core/FormLabel';

import { grey100 } from 'material-ui/styles/colors';

import validatorjs from 'validatorjs';

import './Login.css';
import smallLogo from './represent_white_outline.svg';


const RaisedButton = (props) => {
  return <Button variant="contained" {...props} />
};

const fields = [{
  name: 'username',
  label: 'Username',
  placeholder: 'Enter your username',
  rules: 'required|string',
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  rules: 'required|string',
}];
const plugins = { dvr: validatorjs };
const loginForm = new MobxReactForm({ fields }, { plugins, {} });

@inject("authStore", "routing")
@observer
export default class Login extends Component {

  constructor() {
    super();

    this.facebookLoginCallback = this.facebookLoginCallback.bind(this);
  }

  render() {
    const { authStore, routing } = this.props;
    const { push, goBack, location } = routing;

    if (authStore.currentUser) {
      return <Redirect to={location.state && location.state.from ? location.state.from : "/"} />;
    }

    return (
      <div>
        <Dialog open={true} aria-labelledby="login-dialog-title">
          <DialogTitle id="login-dialog-title">Please login to continue</DialogTitle>
          <DialogContent>
            <form onSubmit={() => { authStore.login(loginForm.values()) }}>
              <TextField
                fullWidth
                required
                margin="normal"
                {...loginForm.$('username').bind()}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                {...loginForm.$('password').bind()}
              />
              <FormLabel error={authStore.errors}>{authStore.errors}</FormLabel>
            </form>
          </DialogContent>
          <DialogActions>
            <RaisedButton
              onClick={() => { authStore.login(loginForm.values()) }}
              color="primary" 
              disabled={!loginForm.isValid}
            >
              Login
            </RaisedButton>
            <RaisedButton onClick={() => push("/join/")} color="primary">
              Sign Up
            </RaisedButton>
            <RaisedButton onClick={() => push("https://app.represent.me/access/forgot-password/")} color="default">
              Reset Password
            </RaisedButton>
            <FacebookLogin
              cssClass="custom-facebook-login-button"
              appId={String(window.authSettings.facebookId)}
              autoLoad={false}
              fields="name,email,picture"
              callback={this.facebookLoginCallback}
              style={{
                display: 'inline-block',
                width: '100%',
              }}
              textButton="Connect with Facebook"
              disableMobileRedirect={true}
            />
            <RaisedButton onClick={() => goBack} color="secondary">
              Cancel
            </RaisedButton>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  facebookLoginCallback(result) {
    const { authStore } = this.props;
    if(result.accessToken) {
      authStore.loginYeti('facebook', result.accessToken);
    }
  }
}
