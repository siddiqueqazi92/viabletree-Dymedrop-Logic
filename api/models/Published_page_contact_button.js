/**
 * Published_page_contact_button.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "published_page_contact_buttons",
  attributes: {
    page_id: {
      model: "page",
    },
    hudl: {
      type: "string",
    },
    maxpreps: {
      type: "string",
    },
    email: {
      type: "string",
    },
    fb: {
      type: "string",
    },
    insta: {
      type: "string",
    },
    linkedin: {
      type: "string",
    },
    medium: {
      type: "string",
    },
    phone: {
      type: "string",
    },
    pinterest: {
      type: "string",
    },
    reddit: {
      type: "string",
    },
    snapchat: {
      type: "string",
    },
    tiktok: {
      type: "string",
    },
    twitch: {
      type: "string",
    },
    twitter: {
      type: "string",
    },
    youtube: {
      type: "string",
    },
    
    is_deleted :{
      type: "boolean",
      defaultsTo: false,
    }
  },
  customToJSON: function () {
    let obj = this
    let omit = [  
      "id",
      "page_id",
      "createdAt",
      "updatedAt",       
    ]
    if (!obj.hudl) {
      omit.push("hudl")
    }
    if (!obj.maxpreps) {
      omit.push("maxpreps")
    }
    if (!obj.email) {
      omit.push("email")
    }
    if (!obj.fb) {
      omit.push("fb")
    }
    if (!obj.insta) {
      omit.push("insta")
    }
    if (!obj.linkedin) {
      omit.push("linkedin")
    }
    if (!obj.medium) {
      omit.push("medium")
    }
    if (!obj.phone) {
      omit.push("phone")
    }
    if (!obj.pinterest) {
      omit.push("pinterest")
    }
    if (!obj.reddit) {
      omit.push("reddit")
    }
    if (!obj.snapchat) {
      omit.push("snapchat")
    }
    if (!obj.tiktok) {
      omit.push("tiktok")
    }
    if (!obj.twitch) {
      omit.push("twitch")
    }
    if (!obj.twitter) {
      omit.push("twitter")
    }
    if (!obj.youtube) {
      omit.push("youtube")
    }
    return _.omit(this, omit);
  },
};
