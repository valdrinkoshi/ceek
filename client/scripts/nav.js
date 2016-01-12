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
    if (selectedKey === 3) {
      Parse.User.logOut();
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
        <NavItem className='ceek-nav-item text-uppercase' href={item.href} eventKey={i} >{item.text}</NavItem>
      );
    }, this);
    return (
      <Navbar className= 'ceek-nav-navbar' brand={ceekLogo} activeKey={selectedItem}>
        <Nav navbar right onSelect={this.handleSelect}>
          {navigationItems}
        </Nav>
      </Navbar>
    );
  }
});

module.exports = CeekNav;