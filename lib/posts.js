//common code
Posts = new Mongo.Collection('posts');

//we need to make sure we scrub the html tags from the user
//before we display it to prevent security issues
Posts.before.insert(function(userId, doc) {
  if (Meteor.isServer && doc.inputHtml) {
    doc.outputHtml = sanitizeHtml(doc.inputHtml);
  }
});

Posts.after.update(function(userId, doc, fieldNames, modifier) {
  if (Meteor.isServer && this.previous.inputHtml !== doc.inputHtml) {
    Posts.update({_id: doc._id}, {$set: {outputHtml: doc.inputHtml}});
  }
});

Posts.allow({
  insert: function (userId, doc) {
    return true;
  },
  //user should be able to update field, but not the outputHtml field (see below)
  update: function (userId, doc, fields, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  }
});

Posts.deny({
  //we prevent user from updating outputHtml field to prevent js injection attack
  update: function (userId, doc, fields, modifier) {
    return _.contains(fields, 'outputHtml');
  },
  remove: function (userId, doc) {
    return true;
  }
});
