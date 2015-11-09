var getObjectById = function(className, objectId) {
  return getObjectWithProperties(className, [{name: 'objectId', value: objectId}]);
};

var getObjectWithProperties = function(className, properties) {
  return getObjectsWithProperties(className, properties, false);
};

var getObjectsWithProperties = function(className, properties, all) {
  console.log('>getObjectsWithProperties:', properties);
  //a little security checks to make sure we don't run empty queries
  if (!Array.isArray(properties)) {
    properties = [];
  }
  if (properties.length === 0 && !all) {
    return Parse.Promise.as(null);
  }
  var objectQuery = new Parse.Query(className);
  var ascendingAction = false;
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    var operator = 'equalTo';
    if (property.operator) {
      operator = property.operator;
    }
    if (property.name === 'ascending') {
      ascendingAction = true;
    }
    objectQuery[operator](property.name || null, property.value || null)
  }
  if (!ascendingAction) {
    objectQuery.ascending('createdAt');
  }
  if (all) {
    return objectQuery.find({ useMasterKey: true });
  } else {
    return objectQuery.first({ useMasterKey: true });
  }
};

module.exports = {
  getObjectById: getObjectById,
  getObjectWithProperties: getObjectWithProperties,
  getObjectsWithProperties: getObjectsWithProperties
};