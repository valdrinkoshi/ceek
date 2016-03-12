var React = require('react');

var JobMatchingConfirmationMessage = React.createClass({
  getDefaultProps() {
    return {
      show: false
    };
  },

  render() {
    var modalMessage = 'Your profile looks great! We will notify you once we find the matched positions.';
    if (!this.props.statusOnMarket) {
      modalMessage = 'Thanks for using Ceek! The job matching is deactivated as per your request.';
    }
    return (
      <Modal show={this.props.show} onHide={jQuery.noop}>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer><Button onClick={this.props.onClose}>Close</Button></Modal.Footer>
      </Modal>
    );
  }
});

module.exports = JobMatchingConfirmationMessage;
