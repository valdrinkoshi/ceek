var getObjectById = function(className, objectId, include) {
  return getObjectWithProperties(className, [{name: 'objectId', value: objectId}], include);
};

var getObjectWithProperties = function(className, properties, include) {
  return getObjectsWithProperties(className, properties, false, include);
};

var getObjectsWithProperties = function(className, properties, all, include) {
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
    var value = property.value;
    if (typeof value === "undefined") {
      value = null;
    }
    objectQuery[operator](property.name || null, value)
  }
  if (!ascendingAction) {
    objectQuery.ascending('createdAt');
  }
  if (Array.isArray(include)) {
    for (var i = 0; i < include.length; i++) {
      objectQuery.include(include[i]);
    }
  }
  if (all) {
    return objectQuery.find({ useMasterKey: true });
  } else {
    return objectQuery.first({ useMasterKey: true });
  }
};

var success = function (res, data) {
  if (res.success) {
    return res.success(data);
  }
  if (typeof data !== 'object') {
    data = {msg: data};
  }
  return writeResponse(res, 200, 'application/json', JSON.stringify(data));
}

var fail = function (res, data) {
  if (res.error) {
    return res.error(data);
  }
  if (typeof data !== 'object') {
    data = {msg: data};
  }
  return writeResponse(res, 400, 'application/json', JSON.stringify(data));
}

var writeResponse = function(res, statusCode, contentType, data) {
  res.writeHead(statusCode, {
    'Content-Type': contentType
  });
  res.end(data);
  return res;
}

module.exports = {
  getObjectById: getObjectById,
  getObjectWithProperties: getObjectWithProperties,
  getObjectsWithProperties: getObjectsWithProperties,
  fail: fail,
  success: success
};
