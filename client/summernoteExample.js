/**
 * updatePost updates a document in Posts collection
 * @param {String} postId - the id of a document in Posts collection
 * @param  {String} contents  - html tags that a user has provided
 */
function updatePost (postId, contents) {
  Posts.update({_id: postId}, {$set: {inputHtml: contents}}, function (e) {
    if (e) {
      console.error('error: unable to write to Posts collection', e);
    }
  });
}
//debounce updatePost so we don't slam mongo with requests
var debounceUpdatePost = _.debounce(updatePost, 500);

Template.userPage.onCreated(function () {
    this.subscribe('allPosts');
});

Template.inputHtml.onRendered(function() {
  var postId = null; //we don't know what the id of the post is
  var pageId = 'page1';
  //let's make sure we a posts records to save to
  var userPost = Posts.findOne({
    'pageId' : 'page1'
  });
  if (typeof userPost === 'undefined' || userPost === null) {
    //unable to find a post, just create one
    postId = Posts.insert({
      pageId: pageId,
      inputHtml: null,
      outputHtml: null
    });
  } else {
    postId = userPost._id; //a userPost exists, so set the postId
  }
  //initialize summernote
  var summerInput = this.$('#summerInput');
  summerInput.summernote({
    //we set a callback to load up the data on init
    onInit: function () {
      var inputHtml = Posts.findOne({_id: postId});
      summerInput.code(inputHtml.inputHtml);
    },
    //we set a callback on the summernote onChange event
    onChange: function(contents) {
      debounceUpdatePost(postId, contents);
    }
  });
});

Template.outputHtml.helpers({
  outputHtml: function () {
    var post = Posts.findOne({pageId: 'page1'});
    return post.outputHtml;
  }
});
