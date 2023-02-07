module.exports = {


  friendlyName: 'Get slug',


  description: '',


  inputs: {
    title: {
      type: 'string',
      required:true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Slug',
    },

  },


  fn: async function (inputs,exits) {
    try {
      let title = inputs.title      
      title = title.trim().replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').toLowerCase();
      title = title.replace( /  +/g, ' ' ) 
      title = title.replace(/ /g, "")
      title = title.replace(/\\"/g, '')
      title = title.replace(/[^a-z0-9_-]/gi,'');
      let slug = title
      let i = 1;
      let found = null
      do {        
         found = await Page.find({ where: { slug } }).limit(1);
        if (found.length) {
          slug = title + `${i++}`;
        }
        else {
          return exits.success(slug)
        }
      }while(found.length)
    } catch (err) {
      sails.log.error(`Error in helper pages/get-slug. ${err}`);
    }

  }


};

