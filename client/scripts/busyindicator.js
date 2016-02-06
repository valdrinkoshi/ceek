var React = require('react');

var BusyIndicator = React.createClass({

  getDefaultProps() {
    return {
      show: false
    };
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={jQuery.noop}>
        <Modal.Body>Loading&hellip;</Modal.Body>
      </Modal>
    );
  }
});

module.exports = BusyIndicator;
