import React, {Component} from 'react'
import moment from 'moment'
import { observer, inject } from "mobx-react"
import ReactMarkdown from 'react-markdown';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';


import Left from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import Right from 'material-ui/svg-icons/hardware/keyboard-arrow-right';


const styles = {
  hiddenIcon: {
    display: 'none'
  },
  icon: {
    width:'50px',
    height: '50px'
  }
  
}

@inject("UserStore")
class QuestionFlowVote extends Component {
  
  constructor(props) {
    super(props)
    //ToDo defHideAnswer bind
    this.state = {
      votingModePrivate: props.UserStore.userData.get('"defHideAnswers"'),
      text: props.UserStore.userData.get('"defHideAnswers"') ? 'privately' : 'publicky'
    }
    this.changeVoteMode = this.changeVoteMode.bind(this)
  }

  changeVoteMode() {
    this.setState({
      votingModePrivate: !this.state.votingModePrivate,
      text: this.state.votingModePrivate ? 'publicky' : 'privately'
    })
  }

  render() {

    console.log(this.props.UserStore.userData.keys())
    const { items, index, onVote, navigateNext, getNextQuestion, getPrevQuestion, currentQuestion } = this.props
    const item = items[index];
    const { hiddenIcon, icon } = styles
    const showAnswered = !!currentQuestion.my_vote.length
    return (
       <div style={{height: '100%'}}>
          <div className="answering-mode-wrapper">Answering <a onClick={this.changeVoteMode}>{ this.state.text }</a></div>
          {
            showAnswered && 
              <div className="answered">
                Answered on {moment(currentQuestion.my_vote[0].modified_at).format('DD MMM')}. Click again to change or confirm
              </div>
          }

            {item.type === "Q" && <RenderedQuestion id={item.object_id} index={index} onVote={onVote} key={"FlowTransition" + index} defHideAnswer={this.state.votingModePrivate}/>}
            {item.type === "B" && <RenderedBreak title={item.content_object.title} text={item.content_object.text} onContinue={navigateNext}/>}

          <div className="nav-buttons">
            <div>
              <Left style={ (index < 1) ? hiddenIcon : icon } onClick={getPrevQuestion}/>
            </div>
            <div>
              <Right style={Object.assign(icon, { marginRight:'5px' })} onClick={getNextQuestion}/>
            </div>
          </div>

        </div>
    )
  }
}

const MiddleDiv = ({children}) => (
  <div style={{ display: 'table', width: '100%', height: '70vh', overflow: 'scroll' }}>
    <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 10px' }}>
      {children}
    </div>
  </div>
)

const RenderedQuestion = inject("QuestionStore")(observer(({QuestionStore, id, index, onVote, defHideAnswer}) => {

  let {question, my_vote, subtype, choices} = QuestionStore.questions.get(id)

  let myVote = null;
  if(my_vote.length > 0 && subtype === 'likert') {myVote = my_vote[0].value}
  if(my_vote.length > 0 && subtype === 'mcq') {myVote = my_vote[0].object_id}

  return (
    <MiddleDiv>
      <h1 className={"questionTextFix-" + index}>{question}</h1>
      {subtype === "likert" && <LikertButtons value={myVote} onVote={onVote} defHideAnswer={defHideAnswer}/>}
      {subtype === "mcq" && <MCQButtons value={myVote} onVote={onVote} defHideAnswer={defHideAnswer} choices={choices}/>}
    </MiddleDiv>
  )

}))

const RenderedBreak = ({title, text, onContinue}) => (
  <MiddleDiv>
    <h1>{ title }</h1>
    <ReactMarkdown source={ text } renderers={{Link: props => <a href={props.href} target="_blank">{props.children}</a>}}/>
    <RaisedButton label="Continue" onClick={onContinue} primary />
  </MiddleDiv>
)


const LikertButtons = ({value, onVote, defHideAnswer}) => {
  let likertJSX = [];
  for (let i = 1; i <= 5; i++) {
    likertJSX.push(<div
      className={ "likertButton likertButton" + i + ( value && value !== i ? " likertButtonDimmed" : "")}
      key={i}
      onTouchTap={() => onVote(i, defHideAnswer)}></div>);
  }
  return (<div style={{overflow: 'hidden', textAlign: 'center', margin: '0 auto', marginBottom: '60px'}}>{likertJSX.map((item, index) => {return item})}</div>);
}

const MCQButtons = ({choices, value, onVote, defHideAnswer}) => (
  <div style={{paddingBottom: '50px'}}>
    {choices.map((choice, index) => {
      let activeMCQ = value === choice.id ? 'activeMCQ' : '';
      return (
        <div key={`p-${index}`} className={`mcqButton ${activeMCQ}`} onTouchTap={() => onVote(choice.id, defHideAnswer)}>{choice.text}</div>
      );
    })}
  </div>
)

export default QuestionFlowVote;