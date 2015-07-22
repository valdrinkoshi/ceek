function validateForm (formDefinition, formValue) {
  return validateField(formDefinition.meta, formValue);
};

function validateFieldByName (fieldName, fieldValue) {
  //TODO: perform actual form validation based on type
  //if field is not valid, either set the field to null or throw exception (based on flag?)
  return fieldValue;
};

function validateField (fieldMeta, fieldValue) {
  switch (fieldMeta.kind) {
    case 'irreducible':
      return validateFieldByName(fieldMeta.name, fieldValue);
    case 'struct':
      var struct = {};
      var props = fieldMeta.props;
      for (var prop in props) {
        struct[prop] = validateField(props[prop].meta, fieldValue[prop]);
      }
      return struct;
    case 'maybe':
      return validateField(fieldMeta.type.meta, fieldValue);
    case 'list':
      var listValues = [];
      for (var i = 0; i < fieldValue.length; i++) {
         listValues.push(validateField(fieldMeta.type.meta, fieldValue[i]));
      }
      return listValues;
  }
};

module.exports = {
  validateForm: validateForm
};