/*jshint -W069 */
var async = require('async'),
assign = require('lodash/assign');

module.exports = function(client){
  var doRequest = require('../util/doRequest')(client),
  urlBuilder = require('../util/urlBuilderTools'),
  conveniences,
  crudl = {
    // We're the only one calling this function, so relatively safe in our params
    list : function(listId, cb){
      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";

      //FieldValuesAsText is not supported here by Sharepoint, Append filterFields
      // and / or selectFields  and / or expandFields to host
      host = urlBuilder.augmentURL(host, false, client.filterFields, client.selectFields, client.expandFields);

      return doRequest(host, function(err, items){
        if (err){
          return cb(err);
        }
        items = conveniences('ListItems', items, listId);
        return cb(null, items);
      });
    },
    read : function(listId, itemId, cb){
      if (!listId || !itemId){
        return cb(new Error('Error reading - unspecified listId or itemId'));
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + itemId + ")",
      fileHost = host + '/File';

      //Append fieldValuesAsText (filters are not supported by Sharepoint at the item level)
      // and / or selectFields  and / or expandFields to host
      host = urlBuilder.augmentURL(host, client.fieldValuesAsText, null, client.selectFields, client.expandFields);

      async.parallel({
        item : async.apply(doRequest, host),
        file : async.apply(doRequest, fileHost)
      }, function(err, response){
        if (err){
          return cb(err);
        }
        var item = response.item;
        item.File = response.File;

        item = conveniences('ListItem', item, listId);
        return cb(null, item);
      });
    },
    create : function(listId, listItem, cb){
      if (!listId || !listItem){
        return cb(new Error('No list or listItem specified'));
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";
      listItem = assign({
        "__metadata" : {
          "type" : "SP.List"
        }
      }, listItem);
      return doRequest({
        url : host,
        method : 'POST',
        json : listItem,
        headers: {
          'X-RequestDigest': client.baseContext,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'POST'
        }
      }, function(err, createResult){
        if (err){
          return cb(err);
        }
        createResult = conveniences('ListItem', createResult, listId);
        return cb(null, createResult);
      });
    },
    update : function(listId, listItem, cb){
      if (!listId || !listItem){
        return cb(new Error('No list or listItem specified'));
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + listItem.itemId + ")";

      //remove the itemId property as we don't need it in the post data
      delete listItem['itemId'];
      return doRequest({
        url : host,
        method : 'POST',
        body : listItem,
        headers: {
          'X-RequestDigest': client.baseContext,
          'If-Match': '*',
          'X-HTTP-Method': 'MERGE'
        }
      }, function(err, updateResult){
        if (err){
          return cb(err);
        }
        updateResult = conveniences('ListItem', updateResult, listId);
        return cb(null, updateResult);
      });
    },
    del : function(listId, itemId, cb){
      if (!listId || !itemId){
        return cb(new Error('Error deleting - unspecified listId or itemId'));
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + itemId + ")";
      return doRequest({
        url : host,
        method : 'POST',
        headers: {
          'X-RequestDigest': client.baseContext,
          'If-Match': '*',
          'X-HTTP-Method': 'DELETE'
        }
      }, cb);
    }
  };
  crudl['delete'] = crudl.del;
  conveniences = require('../util/conveniences')(crudl);
  return crudl;
};
