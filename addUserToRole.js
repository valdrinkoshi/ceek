var Parse = require('parse').Parse;

var userId = process.argv[2] || '';
var roleName = process.argv[3] || '';
var masterKey = process.argv[4] || 'QgS7kRdgVFtKjhu8ltGLS0fCZPWeqSczdOss8sQE';

if (!userId || !roleName) {
  console.error('>Usage:', process.argv[0], process.argv[1], '<userId>', '<roleName>');
  return;
}

Parse.initialize('9PZPCDHudfXlMLExqMmEMlP9oKj3xlCXFuP0VQOT', '8D9m7WkarSiIUtYmHN4ZFVgSbL6182j8PfVjOpV1', masterKey);
var userRoleQuery = new Parse.Query(Parse.Role);
userRoleQuery.equalTo('name', roleName);
userRoleQuery.ascending('createdAt');
userRoleQuery.first({
  useMasterKey: true,
  success: function (role) {
    if (role) {
      var userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('objectId',  userId);
      userQuery.ascending('createdAt');
      userQuery.first({
        useMasterKey: true,
        success: function (user) {
          if (user) {
            var relation = role.relation('users'); 
            relation.add(user);
            role.save(null, {
              useMasterKey: true,
              success: function () {
                console.log('>User:', userId, 'added to role:', roleName);
              },
              error: function (error) {
                console.log('>Could not add:', userId, ' to role:', roleName, error);
              }
            });
          } else {
            console.log('>Could not find user:', userId);
          }
        },
        error: function (error) {
          console.error('>Error while fetching user', userId, error);
        }
      });
    } else {
      console.error('>Could not find role:', roleName);
    }
  },
  error: function (error) {
    console.error('>Error while fetching role:', roleName, error);
  }
});