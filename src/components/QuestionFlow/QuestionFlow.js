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

import CompleteProfile from './CompleteProfile';
import ErrorReload from '../ErrorReload';
import DynamicConfigService from '../../services/DynamicConfigService';

import './QuestionFlow.css';

// let QuestionFlow = inject("CollectionStore", "QuestionStore", "UserStore")(observer(({ history, UserStore, CollectionStore, QuestionStore, match }) => {

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

@inject('CollectionStore', 'QuestionStore', 'UserStore', 'routing')
@observer
class QuestionFlow extends Component {
  constructor() {
    super();
    this.state = {
      collection: null,
      collectionItems: null,
      networkError: false,
    };
  }

  componentWillMount() {
    const { CollectionStore, match, routing } = this.props;

    console.log('Location:');
    console.log(routing.location.pathname);
    console.log('MatchParams:');
    console.log(match.params);

    console.log('getting collection ', parseInt(match.params.collectionId));
    CollectionStore.getCollectionById(parseInt(match.params.collectionId))
      .then(collection => {
        console.log('coll success');
        console.log(collection);
        this.setState({ collection });
      })
      .catch(error => {
        console.log('coll error');
        console.log(error);
        this.setState({ networkError: true });
      });

    console.log('getting collection ', parseInt(match.params.collectionId));
    CollectionStore.getCollectionItemsById(parseInt(match.params.collectionId))
      .then(collectionItems => {
        console.log('items success');
        console.log(collectionItems);
        this.setState({ collectionItems });
      })
      .catch(error => {
        console.log('items error');
        console.log(error);
        this.setState({ networkError: true });
      });

    this.dynamicConfig = DynamicConfigService;
    if (this.props.match.params.dynamicConfig) {
      this.dynamicConfig.setConfigFromRaw(
        this.props.match.params.dynamicConfig
      );
    }
  }

  render() {
    const {
      history,
      UserStore,
      CollectionStore,
      QuestionStore,
      match,
      routing,
    } = this.props;
    const { collection, collectionItems, networkError } = this.state;

    if (networkError) {
      return <ErrorReload message="We couldn't load this collection!" />;
    }
    if (!collection || !collectionItems || !collectionItems.length) {
      return <LoadingIndicator />;
    }

    const collectionId = parseInt(match.params.collectionId);
    const orderNumber = parseInt(match.params.orderNumber);

    const item = collectionItems[orderNumber];
    //
    // console.log("=============== QUESTIONFLOW")
    // console.log("Location:")
    // console.log(routing.location.pathname);
    // console.log("MatchParams:");
    // console.log(match.params);
    // console.log("CollectionItems:");
    // console.log(collectionItems);
    // console.log("Item:");
    // console.log(item);

    if (!item) {
      console.log('Skipping to end');
      this.navigateToEnd();
      return null;
    }

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'scroll',
        }}
      >
        {item.type === 'Q' &&
          QuestionStore.questions.get(item.object_id).my_vote.length > 0 && (
            <Paper
              style={{
                textAlign: 'center',
                padding: '5px 0',
                backgroundColor: cyan600,
                color: white,
                position: 'fixed',
                width: '100%',
                zIndex: 100,
              }}
              zDepth={1}
            >
              {`You answered this in ${
                monthNames[
                  new Date(
                    QuestionStore.questions.get(
                      item.object_id
                    ).my_vote[0].modified_at
                  ).getMonth()
                ]
              }. Have you changed your mind? `}
              <div
                className="FakeLink"
                style={{ color: 'white' }}
                onClick={() =>
                  history.push(
                    `/survey/${collectionId}/flow/${orderNumber + 1}`
                  )
                }
              >
                Skip &raquo;
              </div>
            </Paper>
          )}

        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <ReactCSSTransitionGroup
            transitionName="FlowTransition"
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
          >
            {item.type === 'Q' && ( // If rendering a question
              <RenderedQuestion
                order={orderNumber}
                key={orderNumber}
                question={QuestionStore.questions.get(item.object_id)}
                onUpdate={choiceId => {
                  routing.push(
                    `/survey/${
                      this.props.match.params.collectionId
                    }/flow/${orderNumber}/answer/${choiceId}/${this.dynamicConfig.encodeConfig()}`
                  );
                }}
              />
            )}

            {item.type === 'B' && ( // If rendering a break
              <RenderedBreak
                break={item.content_object}
                onContinue={() => {
                  if (orderNumber < collectionItems.length - 1) {
                    // If there is a next question
                    this.navigateToNextItem();
                  } else {
                    this.navigateToEnd();
                  }
                }}
              />
            )}
          </ReactCSSTransitionGroup>
        </div>

        <ProgressIndicator
          key="PROGRESS_SLIDER"
          order={orderNumber}
          max={collectionItems.length}
          style={{
            position: 'fixed',
            bottom: '25px',
            width: '100%',
            left: '0',
            padding: '20px 20px 10px 20px',
            boxSizing: 'border-box',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%)',
            height: '70px',
            zIndex: 5,
            pointerEvents: 'none',
          }}
          onChange={(event, value) => {
            if (value < collectionItems.length) {
              // If there is a next question
              this.navigateToItem(value);
            } else {
              this.navigateToEnd();
            }
          }}
        />

        <CompleteProfile />
      </div>
    );
  }

  componentDidMount() {
    questionTextFix(this.props.match.params.orderNumber);
  }

  componentDidUpdate() {
    questionTextFix(this.props.match.params.orderNumber);
  }

  navigateToItem(item) {
    this.props.history.push(
      `/survey/${
        this.props.match.params.collectionId
      }/flow/${item}/${this.dynamicConfig.encodeConfig()}`
    );
  }

  navigateToNextItem() {
    const currentItem = parseInt(this.props.match.params.orderNumber);
    this.props.history.push(
      `/survey/${this.props.match.params.collectionId}/flow/${currentItem +
        1}/${this.dynamicConfig.encodeConfig()}`
    );
  }

  navigateToPreviousItem() {
    const currentItem = parseInt(this.props.match.params.orderNumber);
    this.props.history.push(
      `/survey/${this.props.match.params.collectionId}/flow/${currentItem -
        1}/${this.dynamicConfig.encodeConfig()}`
    );
  }

  navigateToEnd() {
    this.props.history.push(
      `/survey/${
        this.props.match.params.collectionId
      }/end/${this.dynamicConfig.encodeConfig()}`
    );
  }
}

const RenderedBreak = props => (
  <div
    style={{
      display: 'table',
      width: '100%',
      height: '100%',
      position: 'absolute',
    }}
  >
    <div
      className="FlowTransition"
      style={{
        display: 'table-cell',
        verticalAlign: 'middle',
        textAlign: 'center',
        width: '100%',
        padding: '0px 20px 40px 20px',
      }}
    >
      <h1>{props.break.title}</h1>
      <ReactMarkdown
        source={props.break.text}
        renderers={{
          Link: props => (
            <a href={props.href} target="_blank">
              {props.children}
            </a>
          ),
        }}
      />
      <RaisedButton label="Continue" onClick={props.onContinue} primary />
    </div>
  </div>
);

const RenderedQuestion = props => {
  let myVote = null;

  if (props.question.my_vote.length > 0) {
    myVote = props.question.my_vote[0].value;
  }
  // //
  return (
    <div
      style={{
        display: 'table',
        width: '100%',
        height: '100%',
        position: 'absolute',
        overflow: 'hidden',
      }}
    >
      <div
        className="FlowTransition"
        style={{
          display: 'table-cell',
          verticalAlign: 'middle',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
          padding: '0 20px 40px 20px',
        }}
      >
        <h1
          style={{ maxWidth: '400px', margin: '60px auto 30px auto' }}
          className={`questionTextFix${props.order}`}
        >
          {props.question.question}
        </h1>

        {props.question.subtype === 'likert' && (
          <LikertButtons onUpdate={i => props.onUpdate(i)} value={myVote} />
        )}
        {props.question.subtype === 'mcq' && (
          <MCQButtons
            onUpdate={i => props.onUpdate(i)}
            question={props.question}
          />
        )}
      </div>
    </div>
  );
};

const ProgressIndicator = props => (
  <div style={props.style}>
    <p style={{ textAlign: 'center', color: cyan600, margin: '5px 0' }}>
      {props.order + 1} / {props.max}
    </p>
    <Slider
      style={{ backgroundColor: grey300, width: '100%', pointerEvents: 'all' }}
      sliderStyle={{ backgroundColor: white, color: cyan600, margin: '0' }}
      max={props.max}
      min={0}
      value={props.order}
      step={1}
      onChange={props.onChange}
    />
  </div>
);

const LikertButtons = props => {
  const likertJSX = [];
  for (let i = 1; i <= 5; i++) {
    likertJSX.push(
      <div
        className={`likertButton likertButton${i}${
          props.value && props.value !== i ? ' likertButtonDimmed' : ''
        }`}
        key={i}
        onClick={() => props.onUpdate(i)}
      />
    ); // onClick()
  }
  return (
    <div style={{ overflow: 'hidden', textAlign: 'center', margin: '0 auto' }}>
      {likertJSX.map((item, index) => item)}
    </div>
  );
};

// EV: Option #1: Button (bug - doesn't display long text)
// let MCQButtons = (props) => {
//   return (
//     <div>
//       { props.question.choices.map((choice, index) => {
//         return (
//           <RaisedButton
//             primary={!(props.question.my_vote[0] && props.question.my_vote[0].object_id === choice.id)}
//             key={index}
//             label={choice.text}
//             labelStyle={{fontSize: 12}}
//             style={{display:'block', margin: '5px 0px', maxWidth: '600px', minHeight: '25px'}}
//             //overlayStyle={{height: 'auto'}}
//             onClick={() => props.onUpdate(choice.id)}
//         />);
//       })}
//     </div>
//   )
// }

// Option #2: DIV
const MCQButtons = props => (
  <div>
    {props.question.choices.map((choice, index) => (
      <div
        key={`p-${index}`}
        className="mcqButton"
        onClick={() => props.onUpdate(choice.id)}
      >
        {choice.text}
      </div>
    ))}
  </div>
);

const questionTextFix = (key = '') => {
  const target = $(`.questionTextFix${key}`);
  while ((target.height() * 100) / $(document).height() > 20) {
    target.css('font-size', `${parseInt(target.css('font-size')) - 1}px`);
  }
};

export default QuestionFlow;
