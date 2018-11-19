import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import { List, ListItem } from 'material-ui/List';
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import { green100 } from 'material-ui/styles/colors';

@inject('CollectionStore')
@observer
class CollectionSearch extends Component {
  constructor() {
    super();
    this.state = {
      search: '',
    };
  }

  render() {
    const existingQuestionDialogResults = this.props.CollectionStore.searchCollections(
      this.state.search
    );

    return (
      <div>
        <div style={{ padding: '0 10px' }}>
          <TextField
            value={this.state.search}
            hintText="Search for a collection"
            fullWidth
            onChange={(e, newValue) => {
              this.setState({ search: newValue });
            }}
          />
        </div>

        <List>
          {this.state.search.length >= 3 &&
            existingQuestionDialogResults &&
            existingQuestionDialogResults.map((collectionId, index) => (
              <Link
                to={`/collection/${collectionId}`}
                style={{ textDecoration: 'none' }}
                key={index}
              >
                <ListItem
                  onClick={() => {}}
                  hoverColor={green100}
                  primaryText={
                    this.props.CollectionStore.collections.get(collectionId)
                      .name
                  }
                  rightIcon={<ArrowForward />}
                />
              </Link>
            ))}
        </List>
      </div>
    );
  }
}

export default CollectionSearch;
