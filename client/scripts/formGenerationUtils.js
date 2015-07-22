var t = require('tcomb-form');

function generateForm (formDefinition) {
  return generateField(formDefinition.meta);
};

function getFieldByName (fieldName) {
  console.log('>get field of name:', fieldName);
  if (t.hasOwnProperty(fieldName)) {
    return t[fieldName]
  } else {
    throw 'Nope';
  }
};

function generateField (fieldMeta) {
  switch (fieldMeta.kind) {
    case 'irreducible':
      return getFieldByName(fieldMeta.name);
    case 'struct':
      var struct = {};
      var props = fieldMeta.props;
      for (var prop in props) {
        console.log('>generating field for prop:', prop)
        struct[prop] = generateField(props[prop].meta);
      }
      return t.struct(struct);
    case 'maybe':
      return t.maybe(generateField(fieldMeta.type.meta));
      break;
    case 'list':
      return t.list(generateField(fieldMeta.type.meta));
      break;
  }
};

module.exports = {
  generateForm: generateForm
};