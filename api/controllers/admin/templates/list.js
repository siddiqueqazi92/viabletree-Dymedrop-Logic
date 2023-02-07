const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    user: {
      type: "ref",
    },
    search: {
      type: "string",
    },
    obj: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/pages/admin/templates/list\ntime: ",
      moment()
    );
    try {
      let query = {
        where: {
          activation_name: null,
        },
      };
      let getobj = JSON.parse(inputs.obj);
      let filters = JSON.parse(getobj.filter);
      let sorting = JSON.parse(getobj.sort);
      console.log({ filters });
      if (!_.isUndefined(filters.search)) {
        query.where.activation_name = {
          contains: filters.search,
        };
      } else {
        delete query.where;
      }
      if (sorting) {
        sails.log({ sorting });
        query.sort = `${sorting[0]} ${sorting[1]}`;
      }

      if (!_.isUndefined(getobj.range)) {
        getobj.range = JSON.parse(getobj.range);
        query.skip = getobj.range[0];
        query.limit = getobj.range[1];
      }

      console.log({ query });

      const getWhere = query.where;

      const activations = await AdminActivations.find(query);
      const countActivation = await AdminActivations.count(getWhere);
      sails.log.debug(
        "user/pages/admin/templates/list executed\ntime: ",
        moment()
      );
      if (activations) {
        return exits.success({
          status: true,
          message: "Activations found",
          data: activations,
          total: `${activations.length}/${countActivation}`,
        });
      } else {
        return exits.success({
          status: false,
          message: "No listing found",
          data: [],
        });
      }
    } catch (error) {
      sails.log.error(
        "error at user/pages/admin/templates/list error: ",
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
