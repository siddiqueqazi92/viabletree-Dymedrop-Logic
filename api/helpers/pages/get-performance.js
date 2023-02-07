const { sumBy } = require("../../util");


module.exports = {
  friendlyName: "Get performance",

  description: "",

  inputs: {
    page_id: {
      type: "number",
      required: true,
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Performance",
    },
  },

  fn: async function (inputs, exits) {
    let data = null;
    try {
      let page = await Page.findOne({
        where: { id: inputs.page_id },
        select: ["id", "published_at","views"],
      })
        .populate("draft_pages")
        .populate("published_pages")
        .populate("published_contact_buttons")
        .populate("published_links", {
          sort: "clicks DESC",
        });
      if (!page) {
        return exits.success(data);
      }
      if (!page.published_pages.length) {
        return exits.success(data);
      }
      let page_views = page.views;
      
      let link_clicks = sumBy(page.published_links, 'clicks');
      let published_page = !_.isUndefined(page.published_pages)? page.published_pages[0]:page.draft_pages[0];
      let performance = {};
      performance.id = page.id;
      performance.title =  published_page.title;
      performance.screenshot = published_page.screenshot;
      performance.published_at = page.published_at;
      
      performance.clicks = link_clicks;
      performance.views = page_views;
      performance.links = [];
      if (page.published_links.length) {
        let total_clicks = performance.clicks
        for (link of page.published_links) {
          let obj = {};
          obj.id = link.id;
          obj.title = link.title;
          
          obj.clicks = link.clicks
          let divided_clicks = (obj.clicks == 0 && total_clicks == 0)?0:obj.clicks/total_clicks
          obj.progress = await sails.helpers.general.fixDoubleValue(
            divided_clicks * 100
          );
          performance.links.push(obj);
        }
      }

      data = performance;
    } catch (err) {
      sails.log.error(`Error in helper pages/get-performance. ${err}`);
    }
    return exits.success(data);
  },
};
