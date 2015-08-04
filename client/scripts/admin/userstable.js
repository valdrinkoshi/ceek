var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FilterableTable = require('FilterableTable');
var AdminServices = require('../AdminServices.js');

var UsersTable = React.createClass({
  getInitialState() {
    return {
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
        data: data,
        columns: ['firstName', 'lastName'],
        filters: ['firstName']
      });
    });
  },

  _handleFilter: function(filters) {
    this.getUsers(filters);
    return;
  },

  render() {
    
    return (
      <div>
        
        <FilterableTable data={this.state.data} onFilter={this._handleFilter} columns={this.state.columns} filters={this.state.filters} />
      </div>
    );
  }
});

module.exports = UsersTable;
