import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import FacebookLogin from 'react-facebook-login';

import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { grey100 } from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { Redirect } from 'react-router-dom';

import DynamicConfigService from '../../services/DynamicConfigService';

import './Login.css';
import smallLogo from './represent_white_outline.svg';

@inject("UserStore")
@inject("routing")
@observer
export default class Login extends Component {

  constructor() {
    super();

    this.state = {
      email: "",
      password: "",
      problems: null
    }
    this.attemptLogin = this.attemptLogin.bind(this);
    this.facebookCallback = this.facebookCallback.bind(this);
  }

  componentWillMount() {
    if(this.props.match.params.email) {
      this.setState({email: decodeURIComponent(this.props.match.params.email)});
    }

    this.dynamicConfig = DynamicConfigService;
    if(this.props.match.params.dynamicConfig) {
      this.dynamicConfig.setConfigFromRaw(this.props.match.params.dynamicConfig)
    }
  }

  render() {
    const { UserStore, routing } = this.props;
    const { history, push, goBack, location } = routing;

    if (UserStore.isLoggedIn()) {
      return <Redirect to={location.state && location.state.from ? location.state.from : "/"} />;
    }

    console.log("======= LOGIN");
    console.log("Location:");
    console.log(location);
    console.log("Location.state:");
    console.log(location.state);
    console.log("Location.state.from.pathname:");
    console.log(location.state ? location.state.from.pathname : null);

    return (
      <div style={{height: '100%'}}>
        <div style={{ display: 'table', width: '100%', height: '100%' }}>
          <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center', padding: '10px 20px' }}>
            <Paper zDepth={1} style={{padding: '10px 20px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto'}}>
              <p style={{fontWeight: 'bold', margin: '10px 0'}}><img src={smallLogo} style={{height: '30px', verticalAlign: 'middle', marginRight: '10px', marginTop: '-4px'}} />Please login to continue</p>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  this.attemptLogin();
                }}
              >
                <TextField hintText="Username / email" style={{width: '100%'}} value={this.state.email} onChange={(e, newValue) => this.setState({email: newValue})}/><br />
                <TextField hintText="Password" type="password" style={{width: '100%'}} value={this.state.password} onChange={(e, newValue) => this.setState({password: newValue})}/><br />
                <FlatButton
                  type="submit"
                  label="login"
                  style={{width: '100%', marginBottom: '5px'}}
                  backgroundColor={grey100} secondary
                  onClick={this.attemptLogin}
                />
              </form>
              <FacebookLogin
                cssClass="custom-facebook-login-button"
                appId={String(window.authSettings.facebookId)}
                autoLoad={false}
                fields="name,email,picture"
                callback={this.facebookCallback}
                style={{
                  display: 'inline-block',
                  width: '100%',
                }}
                textButton="Connect with Facebook"
                disableMobileRedirect={true}
                />
              <p style={{textAlign: 'center', fontSize: '12px'}}>
                By using the service, you agree to the
                <a href="https://represent.me/legal/terms/">terms and conditions</a> and
                <a href="https://represent.me/legal/privacy-policy/">privacy policy</a>
                <br/>
                <br/>
                <a onClick={() => push("/join/")} className="FakeLink">{"Don't have an account?"}</a>
                <br/>
                <a onClick={() => push("https://app.represent.me/access/forgot-password/")} className="FakeLink">{"Forgotten your password?"}</a>
              </p>
            </Paper>
            {history.length > 1 &&
              <Paper onClick={goBack} zDepth={1} style={{padding: '10px 20px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', marginTop: '10px'}}>
                <a className="FakeLink">&larr; {"back"}</a>
              </Paper>
            }
          </div>
        </div>

        <Dialog
          title="Could not complete login"
          open={this.state.problems ? true : false}
          onRequestClose={() => this.setState({problems: null})}
          actions={
            <FlatButton
              label="Close"
              primary={true}
              onTouchTap={() => this.setState({problems: null})}
            />
          }
        >
          {this.state.problems && this.state.problems.map((problem, index) => {
            return <p key={index}>{problem}</p>
          })}
        </Dialog>

      </div>
    )
  }

  attemptLogin() {
    const { UserStore, routing } = this.props;

    UserStore.authLogin(this.state.email, this.state.password)
      .catch(((error) => {
        console.log("AUTH LOGIN ERROR");
        console.log(error);
        if (error.response.data.non_field_errors) {
          this.setState({ problems: ["Username / password combination not found! Please check your details and try again"] });
        } else if (error) {
          this.setState({ problems: JSON.stringify(error.response.data).replace(/:/g, ": ").replace(/[&\/\\#+()$~%.'"*?<>{}\[\]]/g, "").split(",") });
        }
      }).bind(this));
  }

  facebookCallback(result) {
    if(result.accessToken) {
      this.props.UserStore.authYeti('facebook', result.accessToken);
    }
  }
}
