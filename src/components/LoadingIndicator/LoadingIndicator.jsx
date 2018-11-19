import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import { cyan600 } from 'material-ui/styles/colors';

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#eeeeee',
};

const LoadingIndicator = ({visible, text}) => {
  return visible && (
    <div style={containerStyle}>
      <CircularProgress size={80} thickness={5} color={cyan600} />
    </div>
  );
};

LoadingIndicator.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string,
};

LoadingIndicator.defaultProps = {
  visible: true,
  text: 'Loading...',
};

export default LoadingIndicator;
