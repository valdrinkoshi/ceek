var classNames = require('classnames');

/*CeekNav*/
var CeekNav = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getDefaultProps() {
    return {
      selectedItem: 0,
      items: []
    };
  },

  getInitialState() {
    return {
      selectedItem: 0
    };
  },

  handleSelect (selectedKey, href) {
    if (selectedKey === 100) {
      this.props.logout();
      return;
    }
    if (selectedKey === 99) {
      this.props.changeMarketStatus();
      return;
    }
    this.transitionTo(href);
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(selectedKey, href);
    }
  },

  componentWillReceiveProps() {
    this.setState({
      selectedItem: this.props.selectedItem
    });
  },

  render() {
    var ceekLogo = <img src='../imgs/index-img-ceek.png'/>
    var selectedItem = this.state.selectedItem;
    var navigationItems = this.props.items.map(function (item, i) {
      return (
        <NavItem key={i} className='ceek-nav-item text-uppercase' href={item.href} eventKey={i} >{item.text}</NavItem>
      );
    }, this);
    var statusButtonText = 'start job matching';
    if (this.props.statusOnMarket) {
      statusButtonText = 'take me off the market';
    }
    var marketStatusButtonClasses = classNames({
      'ceek-nav-item': true,
      'text-uppercase': true,
      'market-status-nav-item': true,
      'market-status-off-market': !this.props.statusOnMarket
    });
    var marketStatusButton = <NavItem className={marketStatusButtonClasses} eventKey={99}>{statusButtonText}</NavItem>;
    var logoutButton = <NavItem className='ceek-nav-item text-uppercase' href='/' eventKey={100}>logout</NavItem>
    if (!this.props.loggedIn) {
      marketStatusButton = undefined;
      logoutButton = undefined;
    }
    return (
      <Navbar className= 'ceek-nav-navbar' brand={ceekLogo} activeKey={selectedItem}>
        <Nav navbar right onSelect={this.handleSelect}>
          {navigationItems}
          {marketStatusButton}
          {logoutButton}
        </Nav>
      </Navbar>
    );
  }
});

module.exports = CeekNav;