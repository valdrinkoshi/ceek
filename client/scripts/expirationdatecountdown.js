var ExpirationDateCountDown = React.createClass({
  getInitialState () {
    return {
      hours: -1,
      minutes: -1
    };
  },
  computeRemainingTime () {
    var expirationDate = this.props.expirationDate;
    var today = new Date();
    var expired = true;
    var hours = 0;
    var minutes = 0;
    if (today < expirationDate) {
      var dateDiff = expirationDate - today;
      var diffSeconds = dateDiff/1000;
      var hoursInADay = (60*60);
      hours = Math.floor(diffSeconds/hoursInADay);
      minutes = Math.floor((diffSeconds%hoursInADay)/60);
      expired = false;
    }
    this.setState({
      hours: hours,
      minutes: minutes,
      expired: expired
    });
  },
  componentWillMount () {
    this.computeRemainingTime();
  },
  componentDidMount: function() {
    this.interval = setInterval(this.computeRemainingTime, 60000);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  render () {
    return <span className='expiration-date-count-down'>{this.state.hours} hours {this.state.minutes} minutes.</span>;
  },
});

module.exports = ExpirationDateCountDown;