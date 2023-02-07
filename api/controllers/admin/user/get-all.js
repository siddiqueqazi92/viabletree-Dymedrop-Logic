const moment = require("moment");

module.exports = {
  friendlyName: "Get all",

  description: "",

  inputs: {
    sorting: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug("calling user/account/get-all\ntime: ", moment());
    let sorting = JSON.parse(inputs.sorting);
    let where = {
      currentUser: "creator",
    };
    let query = {};
    if (!_.isUndefined(sorting.filter)) {
      sorting.filter = JSON.parse(sorting.filter);
      let objectKeys = Object.keys(sorting.filter);
      for (let i = 0; i < objectKeys.length; i++) {
        if (objectKeys[i] == "q") {
          continue;
        }
        if (objectKeys[i] == "id") {
          where.user_id = sorting.filter[objectKeys[i]];
        } else if (sorting.filter[objectKeys[i]] === "all") {
          continue;
        } else if (objectKeys[i] == "search") {
          where.first_name = { contains: sorting.filter[objectKeys[i]] };
        } else {
          where[objectKeys[i]] = sorting.filter[objectKeys[i]];
        }
      }
      if (!_.isUndefined(sorting.filter.q)) {
        where.or = [
          // { first_name: { contains: sorting.filter.q } },
          // { last_name: { contains: sorting.filter.q } },
          { full_name: { contains: sorting.filter.q } },
          { email: { contains: sorting.filter.q } },
        ];
      }
      query.where = where;
    }
    if (!_.isUndefined(sorting.range)) {
      sorting.range = JSON.parse(sorting.range);
      query.skip = sorting.range[0];
      query.limit = sorting.range[1];
    }
    // if (!_.isUndefined(sorting.sort)) {
    //   sorting.sort = JSON.parse(sorting.sort)
    //   query.sort = `${sorting.sort[0]} ${sorting.sort[1]}`
    // }
    query.sort = `createdAt DESC`;
    // query
    // {
    //   where: { email: { contains: sorting.filter.email } },
    //   sort: `${sorting.sort[0]} ${sorting.sort[1]}`,
    //   skip: sorting.range[0],
    //   limit: sorting.range[1] + 1,
    // }
    try {
      sails.log({ where }, "==>where");
      sails.log(query.where, "qeury");

      let users = await User.find(query);
      //.populate('pages', { where: { published_at: { '!=': null }, deletedAt: null } })
      users = users.map((user) => {
        let id = user.user_id;
        delete user.user_id;
        return {
          ...user,
          id, //password: '', confirm_password: ''
        };
      });
      const totalUsers = await User.count(where);
      sails.log.debug("user/account/get-all executed\ntime: ", moment());
      return exits.success({
        status: true,
        data: users,
        total: `${users.length}/${totalUsers}`,
      });
    } catch (error) {
      sails.log.error(
        "error at user/account/get-all error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        data: {},
        message: "Unknown server error",
      });
    }
  },
};
