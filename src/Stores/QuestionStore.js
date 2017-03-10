import { observable, autorun } from 'mobx';
import axios from 'axios';

class QuestionStore {

  questions = observable.shallowMap({});
  searchCache = observable.shallowMap({});

  loadQuestion(id, forceUpdate = false) {

    if(!forceUpdate && this.questions.has(id)) {
      return true;
    }

    axios.get('/api/questions/', {params: { id: id } })
      .then(function (response) {
        if(!response.data.results[0]) {
          return;
        }
        this.questions.set(response.data.results[0].id, response.data.results[0]);
      }.bind(this));
  }

  searchQuestions(search) {
    if(this.searchCache.has(search)) {
      return this.searchCache.get(search);
    }else {
      axios.get('/api/questions/', {params: { search, page_size: 3 } })
        .then(function (response) {
          if(!response.data.results[0]) {
            return;
          }else {
            let searchResultSummary = [];
            for(let question of response.data.results) {
              if(!this.questions.has(question.id)) {
                this.questions.set(question.id, question);
              }
              searchResultSummary = searchResultSummary.concat([question.id]);
            }
            this.searchCache.set(search, searchResultSummary);
          }
        }.bind(this));
      return false;
    }
  }

  voteQuestionLikert(questionId, value, collection = null) {
    console.log("VOTE LIKERT");
    if(!this.questions.has(questionId) || !value) {
      return false;
    }

    axios.post('/api/question_votes/', {
        object_id: questionId,
        value,
        collection,
        private: true,
      })
      .then(function (response) {
        this.loadQuestion(questionId, true);
      }.bind(this));
  }

  voteQuestionMCQ(questionId, value, collection = null) {
    console.log("VOTE MCQ");
    if(!this.questions.has(questionId) || !value) {
      return false;
    }

    axios.post('/api/question_choice_votes/', {
        object_id: value,
        value: 5,
        collection,
        private: true,
      })
      .then(function (response) {
        this.loadQuestion(questionId, true);
      }.bind(this));
  }

  getCollectionItem(collectionId, questionId) {
    return this.collectionItems.values().filter((item) => { return (item.parent === collectionId && item.question === questionId)})[0];
  }

  updateCollectionQuestions(collectionId, newQuestions) {

    let apiQueue = [];

    for(let questionId of newQuestions) { // Loop through questions looking for new questions and updated orders

      let oldIndex = this.collectionQuestions.get(collectionId).indexOf(questionId);
      let newIndex = newQuestions.indexOf(questionId);

      if (oldIndex == -1) { // New question has been added to the collection
        apiQueue.push(axios.post('/api/question_collection_items/', {
            parent: collectionId,
            question: questionId,
            order: newIndex
          }));
      }else if(oldIndex != newIndex) { // Existing question order has changed
        apiQueue.push(axios.patch('/api/question_collection_items/' + this.getCollectionItem(collectionId, questionId).id + '/', {
            order: newIndex
          }));
      } // Otherwise the question has not changed
    }

    for(let questionId of this.collectionQuestions.get(collectionId)) { // Loop through existing questions looking for deleted items
      let newIndex = newQuestions.indexOf(questionId);
      if(newIndex == -1) { // Question has been deleted
        apiQueue.push(axios.delete('/api/question_collection_items/' + this.getCollectionItem(collectionId, questionId).id + '/'));
      }
    }

    axios.all(apiQueue).then(axios.spread(function() {
      this.loadCollectionQuestions(collectionId, true);
    }.bind(this)));


  }


}

export default QuestionStore;
