var React = require('react');
var classNames = require('classnames');
var t = require('tcomb-form');

var LayoutRow = React.createClass({
  render () {
    return (
      <div className="row">
        {this.props.children}
      </div>
    );
  }
});

function getBootStrapClassName (screenSize, columnValue) {
  return ['col', screenSize, columnValue].join('-');
}

function getBootStrapClassSet (config) {
  var classes = {};
  for (var screenSize in config) {
    classes[getBootStrapClassName(screenSize, config[screenSize])] = true;
  }
  return classNames(classes);
};

function getRemoveButton (clickFn) {
  return <Button className="btn-grey-icon" onClick={clickFn}><Glyphicon glyph="remove" /></Button>;
};

function getAddButton (clickFn) {
  return <button className="btn-blue text-uppercase" onClick={clickFn}>add</button>;
};

var LayoutColumn = React.createClass({
  render () {
    var columnSpan = this.props.columnSpan || 6;
    var bootstrapClasses = getBootStrapClassSet({'xs': 12, 'sm': 12, 'md': columnSpan, 'lg': columnSpan});
    return (
      <div className={bootstrapClasses}>{this.props.children}</div>
    );
  }
});

//tentative for dynamic N columns layout, this is probably the wrong way to do it!
var getMultiColumnsLayout = function(totColumns){
  return function(locals){
    //layouts in two columns
    var bootstrapColumnWidth = 12;
    var columnSpan = bootstrapColumnWidth/totColumns;
    var inputs = locals.inputs;
    if (!inputs && locals.items) {
      inputs = {};
      for (var i = 0; i < locals.items.length; i++) {
        var item = locals.items[i];
        if (item.input && item.buttons) {
          var button = item.buttons[0];
          var removeButton = getRemoveButton(button.click);
          var extendedProps = jQuery.extend(true, {}, item.input.props);
          if (extendedProps.options) {
            if (!extendedProps.options.config) {
              extendedProps.options.config = {};
            }
          } else {
            extendedProps.options = {config: {}};
          }
          extendedProps.options.config.buttonAfter = removeButton;
          item.input = React.cloneElement(item.input, extendedProps);
        }
        inputs[i] = item.input;
      }
    }
    var order = locals.order || Object.keys(inputs);
    var totInputs = order.length;
    var totRows = totInputs/totColumns;
    var inputPerColumn = totInputs/totRows;
    var inputInCurrentColumn = 0;
    var groupedControls = [[]];
    for (var i = 0; i < order.length; i++) {
      var currentChild = (<LayoutColumn key={i} columnSpan={columnSpan}>{inputs[order[i]]}</LayoutColumn>);
      if (inputInCurrentColumn == inputPerColumn) {
        groupedControls.push([]);
        inputInCurrentColumn = 0;
      }
      groupedControls[groupedControls.length-1].push(currentChild);
      inputInCurrentColumn++;
    }
    var layoutNodes = groupedControls.map(function (controls, rowId) {
      return (
        <LayoutRow key={rowId}>
          {controls}
        </LayoutRow>
      );
    });
    var addButton;
    if (locals.add) {
      addButton = getAddButton(locals.add.click);
    }
    return (
      <div>
        <fieldset>
          <legend>{locals.label}</legend>
          {layoutNodes}
        </fieldset>
        {addButton}
      </div>
    );
  };
};

function getBootstrapColumn (element, config) {
  return (
    <div className={getBootStrapClassSet(config)}>
      {element}
    </div>);
}

var getHistoryLayout = function(title1, title2, startDate, endDate, current, description, baseClassName){
  return function(locals){
    var title1El;
    var title2El;
    var startDateEl;
    var endDateEl;
    var currentEl;
    var descriptionEl;
    if (title1) {
      title1El = getBootstrapColumn(locals.inputs[title1], {'xs': 12, 'sm': 12, 'md': 6, 'lg': 6});
    }
    if (title2) {
      title2El = getBootstrapColumn(locals.inputs[title2], {'xs': 12, 'sm': 12, 'md': 6, 'lg': 6});
    }
    if (startDate) {
      startDateEl = getBootstrapColumn(locals.inputs[startDate], {'xs': 12, 'sm': 12, 'md': 4, 'lg': 4});
    }
    if (endDate) {
      endDateEl = getBootstrapColumn(locals.inputs[endDate], {'xs': 12, 'sm': 12, 'md': 4, 'lg': 4});
    }
    if (current) {
      currentEl = getBootstrapColumn(locals.inputs[current], {'xs': 12, 'sm': 12, 'md': 4, 'lg': 4});
    }
    if (description) {
      descriptionEl = (
        <div className={classNames('row', baseClassName+'-description')}>
          {getBootstrapColumn(locals.inputs[description], {'xs': 12, 'sm': 12, 'md': 12, 'lg': 12})}
        </div>);
    }
    return (
      <div>
        <fieldset>
          <div className="row">
            {title1El}
            {title2El}
          </div>
          <div className="row">
            {startDateEl}
            {endDateEl}
            {currentEl}
          </div>
          {descriptionEl}
        </fieldset>
      </div>
    );
  };
};

var getExperienceLayout = function(){
  return getHistoryLayout('companyName', 'role', 'startDate', 'endDate', 'current', 'description', 'experience');
};

var getEducationLayout = function(){
  return getHistoryLayout('collegeName', 'degree', 'startDate', 'endDate', 'current', null, 'education');
};

var getListLayout = function(){
  return function(locals){
    var items = locals.items.map(function (item) {
      return (
          <div className='row list-form-row' key={item.key}>
            <div className={getBootStrapClassSet({'xs': 12, 'sm': 12, 'md': 11, 'lg': 11})}>
              {item.input}
            </div>
            <div className={getBootStrapClassSet({'xs': 12, 'sm': 12, 'md': 1, 'lg': 1})}>
              {getRemoveButton(item.buttons[0].click)}
            </div>
          </div>
      );
    });
    return (
      <fieldset className='form-list-layout'>
        <legend>{locals.label}</legend>
        {items}
        {getAddButton(locals.add.click)}
      </fieldset>
    );
  };
};

var ControlledCarousel = React.createClass({
  getInitialState() {
    return {
      index: 0,
      direction: null
    };
  },

  handleSelect(selectedIndex, selectedDirection) {
    this.setState({
      index: selectedIndex,
      direction: selectedDirection
    });
  },

  render () {
    return (
      <div>
        <span className='steps-subtletext'>There are no right or wrong answers, being honest will match the right jobs for you.</span>
        <Carousel className='form-carousel' activeIndex={this.state.index} direction={this.state.direction} onSelect={this.handleSelect}>
          {this.props.children}
        </Carousel>
      </div>
    );
  }
});

var getCarouselLayout = function(){
  return function(locals){
    var items = React.Children.map(locals.inputs, function (item) {
      return (
        <CarouselItem>
          {item}
        </CarouselItem>
      );
    });
    return (
      <fieldset>
        <legend>{locals.label}</legend>
        <ControlledCarousel>
          {items}
        </ControlledCarousel>
      </fieldset>
    );
  };
};

var forceCustomClass = function(className) {
  return function(locals){
    var options = {
      attrs: locals.attrs,
      config: locals.config
    };
    var textboxUvdom = t.form.Form.templates['textbox'](locals);
    textboxUvdom.attrs.className[className] = true;
    return textboxUvdom;
  };
}

module.exports = {
  getMultiColumnsLayout: getMultiColumnsLayout,
  getListLayout: getListLayout,
  getExperienceLayout: getExperienceLayout,
  getEducationLayout: getEducationLayout,
  getCarouselLayout: getCarouselLayout,
  forceCustomClass: forceCustomClass
}