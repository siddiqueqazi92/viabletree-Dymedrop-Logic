const moment = require("moment");

module.exports = {
  friendlyName: "Get all",

  description: "",

  inputs: {
    sorting: {
      type: "ref",
    },
    filter: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug("calling user/pages/admin/get-all\ntime: ", moment());
    let sorting = JSON.parse(inputs.sorting);
    let query = {};
    let where = {};
    // let user_id = {};
    if (!_.isEmpty(sorting)) {
      sorting.filter = JSON.parse(sorting.filter);
      if (!_.isEmpty(sorting.filter)) {
        sails.log.debug(Object.entries(sorting.filter));
        // sorting.filter = JSON.parse(sorting.filter)
        let objectKeys = Object.keys(sorting.filter);
        for (let i = 0; i < objectKeys.length; i++) {
          if (objectKeys[i] == "is_active") {
            if (
              !sorting.filter[objectKeys[i]] ||
              sorting.filter[objectKeys[i]] === "all"
            ) {
              continue;
            }
            where.is_active = sorting.filter[objectKeys[i]];
            where.is_blocked = !sorting.filter[objectKeys[i]];
          } else if (objectKeys[i] == "q") {
            continue;
          } else if (objectKeys[i] == "id") {
            where.user_id = sorting.filter[objectKeys[i]];
          } else if (objectKeys[i] == "search") {
            continue;
          } else if (objectKeys[i] == "passenable") {
            if (sorting.filter[objectKeys[i]] == "all") {
              continue;
            } else {
              where[objectKeys[i]] = sorting.filter[objectKeys[i]];
            }
          } else {
            where[objectKeys[i]] = sorting.filter[objectKeys[i]];
          }
        }
        if (
          !_.isUndefined(sorting.filter.is_active) &&
          !sorting.filter.is_active
        ) {
          where = {
            or: [{ is_active: false }, { is_blocked: true }],
          };
        }
        if (!_.isUndefined(sorting.filter.q)) {
          let user_ids = {
            where: {
              or: [
                { first_name: { contains: sorting.filter.q } },
                { last_name: { contains: sorting.filter.q } },
                { email: { contains: sorting.filter.q } },
              ],
            },
          };
          let page_ids = {
            where: {
              title: { contains: sorting.filter.q },
            },
          };
          /**
           * TODO
           * PUT BOTH AWAIT REQUESTS IN PROMISE.ALL
           */
          let page_id = await Published_page.find(page_ids).select(["page_id"]);
          page_id = page_id.map((page) => page.page_id);
          let user_id = await User.find(user_ids).select(["user_id"]);
          user_id = user_id.map((user) => user.user_id);
          where = {
            ...where,
            or: [
              { id: { in: [...page_id] } },
              { user_id: { in: [...user_id] } },
            ],
          };
        }
        query.where = {
          ...where,
          published_at: { "!=": null },
          deletedAt: null,
        };
        // where.where = {
        //   ...sorting.filter,
        //   published_at: { '!=': null },
        //   deletedAt: null
        // }
        // where.where = { [`${sorting.filter}`]: sorting.filter, published_at: { '!=': null }, deletedAt: null }
      } else {
        query.where = {
          published_at: { "!=": null },
          deletedAt: null,
          is_deleted: 0,
        };
      }
      if (!_.isUndefined(sorting.range)) {
        sorting.range = JSON.parse(sorting.range);
        query.skip = sorting.range[0];
        query.limit = sorting.range[1];
      }
      if (!_.isUndefined(sorting.sort)) {
        sorting.sort = JSON.parse(sorting.sort);
        query.sort = `${sorting.sort[0]} ${sorting.sort[1]}`;
      }
    }

    try {
      const countWhere = query.where;
      let pages = await Page.getAllPages(query); //({
      // where: { ...where },//email: { contains: sorting.filter.email } },
      //   sort: `${sorting.sort[0]} ${sorting.sort[1]}`,
      //   skip: sorting.range[0],
      //   limit: sorting.range[1] + 1,
      // })
      if (!pages) {
        sails.log.debug(
          "user/pages/admin/get-all error: search/sort/filter error \ntime: ",
          moment()
        );
        return exits.success({
          status: false,
          message: "Unable to GET pages",
        });
      }
      pages = pages.map((page) => {
        // console.log({page});
        page.url = `${sails.config.dymedrop.web_url}${page.url}`;
        let clicks = 0;
        page.page_title = page.published_pages[0].title;
        page.page_id = page.published_pages[0].page_id;
        let obj = { ...page };
        page.published_links.map((link) => {
          clicks += link.clicks;
        });

        let ctr = (clicks / page.views) * 100;
        if (isNaN(ctr) || ctr === Infinity || ctr === -Infinity) {
          obj.ctr = "0%";
        } else {
          ctr = ctr > 0 ? ctr.toFixed(2) : 0;
          obj.ctr = `${ctr}%`;
        }
        return obj;
      });
      let totalPages = await Page.count({ where: countWhere });

      // let pages = await User.find({
      //   where: { ...where },
      //   sort: `${sorting.sort[0]} ${sorting.sort[1]}`,
      //   skip: sorting.range[0],
      //   limit: sorting.range[1] + 1,
      // })
      // pages = users.map(pages => {
      //   return {
      //     ...pages, id: pages.pages_id
      //   }
      // })
      // const totalUsers = await User.count()
      sails.log.debug("user/pages/admin/get-all executed\ntime: ", moment());
      return exits.success({
        status: true,
        message: "GET pages successfully",
        data: pages,
        total: `${pages.length}/${totalPages}`,
      });
    } catch (error) {
      sails.log.error(
        "error at user/pages/admin/get-all error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        message: "Unknown server error",
      });
    }
  },
};
