import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import MessengerPlugin from 'react-messenger-plugin';
import { FacebookButton, TwitterButton } from 'react-social';
import Slider from 'react-slick';

import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FacebookBox from 'material-ui-community-icons/icons/facebook-box';
import TwitterBox from 'material-ui-community-icons/icons/twitter-box';
import CodeTags from 'material-ui-community-icons/icons/code-tags';
import IconButton from 'material-ui/IconButton';
import {
  indigo500,
  blue500,
  bluegrey500,
  white,
} from 'material-ui/styles/colors';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import QuestionPopulationStackedChart from '../charts/QuestionPopulationStackedChart';
import QuestionLiquidPiechart from '../charts/QuestionLiquidPiechart';
import CompareCollectionUsers from '../CompareCollectionUsers';
import DynamicConfigService from '../../services/DynamicConfigService';
import { ResponsiveCollectionContainer } from '../charts/CollectionCharts/CollectionDisplay';

import './CollectionEnd.css';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const questionShareLink = questionId => {
  if (window.self !== window.top) {
    // In iframe
    return `https://share-test.represent.me/scripts/share.php?question=${questionId}&redirect=${encodeURIComponent(
      document.referrer
    )}`;
  }
  // Top level
  return `https://share-test.represent.me/scripts/share.php?question=${questionId}&redirect=${encodeURIComponent(
    location.href
  )}`;
};

@inject('CollectionStore', 'QuestionStore', 'authStore')
@observer
class CollectionEnd extends Component {
  constructor() {
    super();

    this.state = {
      showMessengerDialog: true,
    };
  }

  componentWillMount() {
    const collectionId = parseInt(this.props.match.params.collectionId);
    if (!this.props.CollectionStore.collectionItems.has(collectionId)) {
      this.props.CollectionStore.getCollectionItemsById(collectionId);
    }

    this.dynamicConfig = DynamicConfigService;
    if (this.props.match.params.dynamicConfig) {
      this.dynamicConfig.setConfigFromRaw(
        this.props.match.params.dynamicConfig
      );
    }

    this.setState({
      showMessengerDialog: this.dynamicConfig.config.survey_end
        .messenger_prompt,
    });
  }

  render() {
    const collectionId = parseInt(this.props.match.params.collectionId);
    const collection = this.props.CollectionStore.collections.get(collectionId);

    if (!collection) {
      return null;
    }

    const cardMediaCSS = {
      background:
        'linear-gradient(135deg, rgba(250,255,209,1) 0%,rgba(161,255,206,1) 100%)',
      height: '200px',
      overflow: 'hidden',
      backgroundSize: 'cover',
    };

    const imageStyle = {
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    const outerStyle = {
      // Defaults no cover photo
      height: '100%',
      color: 'black',
      transition: 'all 0.5s ease-in-out',
    };

    const innerStyle = {
      // Defaults no cover photo
      height: '100%',
      overflow: 'scroll',
    };

    if (collection.photo) {
      // Override if cover photo
      outerStyle.backgroundColor = 'rgba(0,0,0,1)';
      if (this.state.collectionImageLoaded) {
        imageStyle.backgroundImage = `url(${collection.photo.replace(
          'localhost:8000',
          'represent.me'
        )})`;
        outerStyle.backgroundColor = 'rgba(0,0,0,0)';
      }
      outerStyle.color = 'white';
      innerStyle.background =
        'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 50%,rgba(0,0,0,1) 100%)';
    }

    if (collection.photo) {
      cardMediaCSS.backgroundImage = `url(${collection.photo.replace(
        'localhost:8000',
        'represent.me'
      )})`;
    }

    let messengerRefData = 'get_started_with_token';
    const authToken = this.props.authStore.getAuthToken();
    if (authToken) {
      messengerRefData += `+auth_token=${authToken}`;
    }

    return (
      <div style={imageStyle}>
        <div style={outerStyle}>
          {collection.photo && (
            <img
              src={collection.photo.replace('localhost:8000', 'represent.me')}
              style={{ display: 'none' }}
              onLoad={() => {
                this.setState({ collectionImageLoaded: true });
              }}
            />
          )}
          <div style={innerStyle}>
            <div
              style={{ overflow: 'hidden', margin: '0 10px', color: 'white' }}
            >
              <h1>
                {collection.name}
                <span>
                  {' '}
                  <FacebookButton
                    appId={window.authSettings.facebookId}
                    element="span"
                    url={document.referrer}
                  >
                    <FacebookBox className="FakeLink" color={indigo500} />
                  </FacebookButton>{' '}
                  <TwitterButton
                    className="FakeLink"
                    element="span"
                    url={document.referrer}
                  >
                    <TwitterBox color={blue500} />
                  </TwitterButton>
                </span>
              </h1>
              <h3>{collection.end_text}</h3>
            </div>

            {this.props.CollectionStore.collectionItems.has(collectionId) && (
              <ResponsiveCollectionContainer
                items={this.props.CollectionStore.collectionItems.get(
                  collectionId
                )}
              />
            )}

            <CollectionEndShare collection={collection} />

            <CollectionEndUserCompare
              userIds={this.dynamicConfig.config.survey_end.compare_users}
            />

            <Dialog
              title="Want awesome powers?"
              modal={false}
              open={this.state.showMessengerDialog}
            >
              You can vote directly from facebook messenger, making it easy to
              have your say in important issues as often as you like. Try it out
              - we think you’ll love it!
              <br />
              <br />
              <span style={{ float: 'left' }}>
                <MessengerPlugin
                  appId={String(window.authSettings.facebookId)}
                  pageId={String(window.authSettings.facebookPageId)}
                  size="xlarge"
                  passthroughParams={messengerRefData}
                />
              </span>
              <span style={{ float: 'right' }}>
                <FlatButton
                  label="Continue"
                  style={{ marginBottom: '10px' }}
                  onClick={() => this.setState({ showMessengerDialog: false })}
                />
              </span>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  getQuestionShareLink() {}
}

class CollectionEndShare extends Component {
  constructor() {
    super();
    this.state = {
      showEmbedDialog: false,
    };
  }

  render() {
    return (
      <ResponsiveCardContainer>
        <Card containerStyle={{ padding: 0 }}>
          <CardText style={{ textAlign: 'center', padding: 0 }}>
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

            <FlatButton
              onClick={() => this.setState({ showEmbedDialog: true })}
              target="_blank"
              label="Embed this Survey"
              fullWidth
              icon={<CodeTags color={bluegrey500} />}
            />
          </CardText>
        </Card>
        <Dialog
          title="Embed this on your website"
          modal={false}
          open={this.state.showEmbedDialog}
          actions={
            <FlatButton
              label="Close"
              onClick={() => {
                this.setState({ showEmbedDialog: false });
              }}
            />
          }
        >
          Copy the following HTML into the source of your website, no additional
          setup required!
          <TextField
            value={`<iframe width="700" height="400" src="https://${
              window.location.host
            }/survey/${this.props.collection.id}"></iframe>`}
            fullWidth
            multiLine
          />
        </Dialog>
      </ResponsiveCardContainer>
    );
  }
}

@inject('QuestionStore')
@observer
class CollectionEndQuestionPieCharts extends Component {
  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: (
        <div>
          <KeyboardArrowLeft />
        </div>
      ),
      nextArrow: (
        <div>
          <KeyboardArrowRight />
        </div>
      ),
      lazyLoad: true,
      autoplay: true,
      autoplaySpeed: 5000,
    };

    return (
      <ResponsiveCardContainer>
        <Card>
          <CardText style={{ margin: '0 10px' }}>
            <Slider {...settings}>
              {this.props.items.map((item, index) => {
                if (item.type === 'Q') {
                  return (
                    <div key={index}>
                      <p style={{ textAlign: 'center' }}>
                        {
                          this.props.QuestionStore.questions.get(item.object_id)
                            .question
                        }
                      </p>
                      <QuestionLiquidPiechart questionId={item.object_id} />
                    </div>
                  );
                }
              })}
            </Slider>
          </CardText>
        </Card>
      </ResponsiveCardContainer>
    );
  }
}

const CollectionEndUserCompare = ({ userIds }) => {
  if (userIds.length === 0) {
    return null;
  }
  return (
    <ResponsiveCardContainer>
      <CompareCollectionUsers userIds={userIds} />
    </ResponsiveCardContainer>
  );
};

const ResponsiveCardContainer = props => (
  <div {...props} className="ResponsiveCardContainer" />
);

export default CollectionEnd;
