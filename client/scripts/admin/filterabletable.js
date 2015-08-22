var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;

var TableRow = React.createClass({
  _handleActionSelect(event) {
    this.props.onSelectAction(event, this.props.rowData);
  },

  render() {
    var data = this.props.rowData;
    var columns = this.props.columns || Object.keys(this.props.rowData);
    var actions = this.props.actions || [];
    var tableColumns = columns.map(function (column, index) {
      return (<td key={index}>{data[column]}</td>);
    });
    var actionsMenuItems = actions.map(function (action, index) {
      return (<MenuItem key={action.eventKey} eventKey={action.eventKey}>{action.name}</MenuItem>);
    });
    return (
      <tr>
        {tableColumns}
        <td>
          <DropdownButton onSelect={this._handleActionSelect} title='Actions' key='actions'>
            {actionsMenuItems}
          </DropdownButton>
        </td>
      </tr>
    );
  }
});

var TableHeader = React.createClass({
  render() {
    var columns = this.props.columns.map(function (column, index) {
      return (<th key={index}>{column}</th>);
    });
    return (
      <tr>
        {columns}
      </tr>
    );
  }
});

var FilterableTable = React.createClass({
  _handleSubmit(e) {
    e.preventDefault();
    var filters = {};
    for (var filterName in this.refs) {
      var filterValue = React.findDOMNode(this.refs[filterName]).value.trim();
      if (filterValue) {
        filters[filterName] = filterValue;
      }
    }
    this.props.onFilter(filters);
    return;
  },

  render() {
    var _this = this;
    var columns = this.props.columns;
    var tableRows = this.props.data.map(function (rowData, index) {
      return (
        <TableRow actions={_this.props.actions} key={index} rowData={rowData} columns={columns} onSelectAction={_this.props.onSelectAction} />
      );
    });

    var filters = this.props.filters.map(function (filter) {
      return (
        <div key={filter}>
          <label>{filter}</label>
          <input ref={filter}></input>
        </div>
      );
    });

    return (
      <div>
      <form onSubmit={this._handleSubmit}>
        {filters}
        <input type='submit' />
      </form>
      <table>
        <TableHeader columns={columns}/>
        {tableRows}
      </table>
      </div>
    );
  }
});

module.exports = FilterableTable;