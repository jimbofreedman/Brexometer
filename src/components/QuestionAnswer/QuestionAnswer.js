import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router-dom';
import Tappable from 'react-tappable';
import $ from 'jquery';

import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import LinearProgress from 'material-ui/LinearProgress';
import { white, cyan600, grey300 } from 'material-ui/styles/colors';
import ReactMarkdown from 'react-markdown';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import LoadingIndicator from '../LoadingIndicator';

import ErrorReload from '../ErrorReload';
import DynamicConfigService from '../../services/DynamicConfigService';

// let QuestionFlow = inject("CollectionStore", "QuestionStore", "authStore")(observer(({ history, authStore, CollectionStore, QuestionStore, match }) => {

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@inject('CollectionStore', 'QuestionStore', 'authStore', 'routing')
@observer
class QuestionAnswer extends Component {
  constructor() {
    super();
    this.state = {
      collection: null,
      collectionItems: null,
      networkError: false,
    };
  }

  componentWillMount() {
    const { CollectionStore, match } = this.props;
    CollectionStore.getCollectionById(parseInt(match.params.collectionId))
      .then(collection => {
        this.setState({ collection });
      })
      .catch(error => {
        this.setState({ networkError: true });
      });

    CollectionStore.getCollectionItemsById(parseInt(match.params.collectionId))
      .then(collectionItems => {
        this.setState({ collectionItems });
      })
      .catch(error => {
        this.setState({ networkError: true });
      });

    this.dynamicConfig = DynamicConfigService;
    if (this.props.match.params.dynamicConfig) {
      this.dynamicConfig.setConfigFromRaw(
        this.props.match.params.dynamicConfig
      );
    }
  }

  componentDidMount() {
    const {
      history,
      authStore,
      CollectionStore,
      QuestionStore,
      match,
      routing,
    } = this.props;
    const { collection, collectionItems, networkError } = this.state;

    // if(networkError) {
    //   return <ErrorReload message="We couldn't load this collection!"/>
    // }else if(!collection || collectionItems === null) {
    //   return <LoadingIndicator/>
    // }

    const collectionId = parseInt(match.params.collectionId);
    const orderNumber = parseInt(match.params.orderNumber);
    const choiceId = parseInt(match.params.choiceId);

    console.log(match.params);
    console.log(collectionItems);

    CollectionStore.getCollectionItemsById(collectionId)
      .then(collectionItems => {
        const item = collectionItems[orderNumber];

        console.log('=============== QUESTIONANSWER');
        console.log('Location:');
        console.log(routing.location.pathname);
        console.log('MatchParams:');
        console.log(match.params);
        console.log('CollectionItems:');
        console.log(collectionItems);
        console.log('Item:');
        console.log(item);

        if (!item) {
          console.log('Skipping to end');
          this.navigateToEnd();
          return;
        }

        const question = QuestionStore.questions.get(item.object_id);

        if (question.subtype === 'likert') {
          QuestionStore.voteQuestionLikert(
            item.object_id,
            choiceId,
            collectionId
          );
        } else if (question.subtype === 'mcq') {
          QuestionStore.voteQuestionMCQ(item.object_id, choiceId, collectionId);
        }

        if (orderNumber < collectionItems.length - 1) {
          // If there is a next question
          console.log('Going to next');
          this.navigateToNextItem();
        } else {
          console.log('Going to end');
          this.navigateToEnd();
        }
      })
      .catch(error => {
        this.setState({ networkError: true });
      });
  }

  navigateToItem(item) {
    this.props.routing.push(
      `/survey/${
        this.props.match.params.collectionId
      }/flow/${item}/${this.dynamicConfig.encodeConfig()}`
    );
  }

  navigateToNextItem() {
    const currentItem = parseInt(this.props.match.params.orderNumber);
    this.navigateToItem(currentItem + 1);
  }

  navigateToPreviousItem() {
    const currentItem = parseInt(this.props.match.params.orderNumber);
    this.navigateToItem(currentItem - 1);
  }

  navigateToEnd() {
    this.props.routing.push(
      `/survey/${
        this.props.match.params.collectionId
      }/end/${this.dynamicConfig.encodeConfig()}`
    );
  }

  render() {
    return <div>hi</div>;
  }
}

export default QuestionAnswer;
