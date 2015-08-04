var React = require('react');

var TableRow = React.createClass({
  render() {
    var data = this.props.rowData;
    var columns = this.props.columns || Object.keys(this.props.rowData);
    var tableColumns = columns.map(function (column, index) {
      return (<td key={index}>{data[column]}</td>);
    });
    return (
      <tr>
        {tableColumns}
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
      filters[filterName] = filterValue;
    }
    this.props.onFilter(filters);
    return;
  },

  render() {
    var columns = this.props.columns;
    var tableRows = this.props.data.map(function (rowData, index) {
      return (
        <TableRow key={index} rowData={rowData} columns={columns} />
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