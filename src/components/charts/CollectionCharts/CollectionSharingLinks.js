import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
// import MessengerPlugin from 'react-messenger-plugin';
import { FacebookButton, TwitterButton } from 'react-social';
import { indigo500, blue500, bluegrey500 } from 'material-ui/styles/colors';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FacebookBox from 'material-ui-community-icons/icons/facebook-box';
import TwitterBox from 'material-ui-community-icons/icons/twitter-box';

const LinksContainer = props => (
  <div className="LinksContainer">{props.children}</div>
);

class CollectionSharingLinksComponent extends Component {
  render() {
    return (
      // <LinksContainer  style={{margin: 0, backgroundColor: 'white'}}>
      <Card
        className="LinksContainerInner"
        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'white' }}
        style={{ margin: 0, backgroundColor: 'white' }}
      >
        <CardText
          style={{
            textAlign: 'center',
            padding: 0,
            color: 'rgb(64, 64, 64)',
            backgroundColor: 'white',
            marginTop: 0,
          }}
        >
          <FacebookButton
            appId={window.authSettings.facebookId}
            element="span"
            url={document.referrer}
          >
            <FlatButton
              label="Share on Facebook"
              fullWidth
              icon={<FacebookBox color={indigo500} />}
            />
          </FacebookButton>

          <TwitterButton element="span" url={document.referrer}>
            <FlatButton
              href="https://github.com/callemall/material-ui"
              target="_blank"
              label="Share on Twitter"
              fullWidth
              icon={<TwitterBox color={blue500} />}
            />
          </TwitterButton>
        </CardText>
      </Card>
      // </LinksContainer>
    );
  }
}

export default CollectionSharingLinksComponent;
