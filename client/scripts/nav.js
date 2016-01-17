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
    switch (selectedKey) {
      case 99: //onmarket status button
        this.props.changeMarketStatus();
        return;
      case 100: //logout button
        this.props.logout();
        return;
      case 101: //brand (ceek logo)
        location.href = href;
        return;
      default:
        break;
    };
    this.setState({
      selectedItem: selectedKey
    });
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
    var ceekLogo = <img className="navbar-brand" src='../imgs/index-img-ceek.png'/>;
    var ceekLogo1 = <img src='../imgs/index-img-ceek.png'/>;
    var selectedItem = this.state.selectedItem;
    var navItemBaseClass = 'ceek-nav-item text-uppercase';
    var navigationItems = this.props.items.map(function (item, i) {
      var navItemClass = classNames(navItemBaseClass, {
        'nav-item-selected': item.href === this.getPath()
      });
      return (
        <NavItem key={i} className={navItemClass} href={item.href} eventKey={i} >{item.text}</NavItem>
      );
    }, this);
    var statusButtonText = 'start job matching';
    if (this.props.statusOnMarket) {
      statusButtonText = 'stop job matching';
    }
    var marketStatusButtonClasses = classNames(navItemBaseClass, 'market-status-nav-item', {
      'market-status-off-market': !this.props.statusOnMarket
    });
    var marketStatusButton = <NavItem className={marketStatusButtonClasses} eventKey={99}>{statusButtonText}</NavItem>;
    var logoutButton = <NavItem className='ceek-nav-item text-uppercase' href='/' eventKey={100}>logout</NavItem>
    if (!this.props.loggedIn) {
      marketStatusButton = undefined;
      logoutButton = undefined;
    }
    return (
      <Navbar className='ceek-nav-navbar' activeKey={selectedItem}>
        <Nav navbar onSelect={this.handleSelect}>
          <NavItem className='ceek-nav-navbar-brand' href='/index.html' eventKey={101} >{ceekLogo}</NavItem>
        </Nav>
        <Nav navbar right onSelect={this.handleSelect}>
          {navigationItems}
          {logoutButton}
          {marketStatusButton}
        </Nav>
      </Navbar>
    );
  }
});

module.exports = CeekNav;