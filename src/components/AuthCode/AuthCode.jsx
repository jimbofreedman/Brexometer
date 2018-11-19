import React from 'react';
import { observer, inject } from 'mobx-react';

const AuthCode = inject('UserStore')(
  observer(props => {
    const code = props.match.params.code;
    const email = props.match.params.email;

    window.API.post('/auth/onetime_signin/', {
      code,
      email,
    })
      .then(response => {
        console.log(response.data);
        if (response.data.access_token) {
          props.UserStore.setupAuthToken(response.data.access_token);
          props.history.push(
            `/${decodeURIComponent(props.match.params.redirect)}`
          );
        } else {
          props.history.push(`/login/${props.match.params.redirect}`);
        }
      })
      .catch(error => {
        props.history.push(`/login/${props.match.params.redirect}`);
      });

    return <p>Logging in...</p>;
  })
);

export default AuthCode;
