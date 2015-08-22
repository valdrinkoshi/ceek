var React = require('react');
var FilterableTable = require('FilterableTable');
var AdminServices = require('../AdminServices.js');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;

var UserDetailModal = React.createClass({
  getInitialState() {
    return {
      show: false
    };
  },

  render() {
    if (!this.props.data) {
      return null;
    }
    return (
      <div>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{this.props.data.firstName}</p>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
});

var UsersTable = React.createClass({
  getInitialState() {
    return {
      showUserDetails: false,
      data: [],
      columns: [],
      filters: []
    };
  },

  componentDidMount() {
    this.getUsers({});
  },

  getUsers(filters) {
    var _this = this;
    AdminServices.GetUsers(filters).then(function (data) {
      _this.setState({
        showUserDetails: false,
        data: data,
        columns: ['firstName', 'lastName'],
        filters: ['firstName', 'emailAddress']
      });
    });
  },

  _handleFilter: function(filters) {
    this.getUsers(filters);
    return;
  },

  _openUserDetails(userData) {
    this.setState({
      showUserDetails: true,
      userData: userData
    });
  },

  _closeUserDetails() {
    this.setState({
      showUserDetails: false
    });
  },

  _handleSelectAction(event, userData) {
    this._openUserDetails(userData);
  },

  render() {
    var actions = [{name: 'View Details', eventKey: '1'}]
    return (
      <div>
        <FilterableTable data={this.state.data} onFilter={this._handleFilter} columns={this.state.columns} filters={this.state.filters} onSelectAction={this._handleSelectAction} actions={actions} />
        <UserDetailModal data={this.state.userData} show={this.state.showUserDetails} onHide={this._closeUserDetails} />
      </div>
    );
  }
});

module.exports = UsersTable;
