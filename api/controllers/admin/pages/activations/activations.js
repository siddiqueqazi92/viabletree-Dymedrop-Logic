const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    user: {
      type: "ref",
    },
    limit: {
      type: "number",
    },
    offset: {
      type: "number",
    },
    obj: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/pages/admin/pages/activations/activations\ntime: ",
      moment()
    );
    try {
      let query = {
        where: {
          is_deleted: 0,
          is_published: 1,
        },
      };
      let getobj = JSON.parse(inputs.obj);
      let filters;
      let sorting;
      if (!_.isUndefined(getobj.filter)) {
        filters = JSON.parse(getobj.filter);
      }
      if (!_.isUndefined(getobj.sort)) {
        sorting = JSON.parse(getobj.sort);
      }
      console.log({ filters });
      let whereCondition = `WHERE activation.is_deleted = 0  `;
      let sorts;
      let limits;
      if (filters) {
        Object.keys(filters).forEach((val) => {
          sails.log(val, "==>");
          if (val == "search") {
            //   query.where.activation_name = {
            //     contains: filters.search,
            //   };

            whereCondition += ` AND activation_name LIKE '%${filters[val]}%'`;
          }
          if (val == "activation_id") {
            //   query.where.id = filters[val];
            whereCondition += ` AND activation.id = '${filters[val]}' `;
          }
          if (val == "id") {
            whereCondition += ` AND activation.id in ('${filters[val].join(
              "','"
            )}')
                `;
          }
        });
      }

      if (sorting) {
        sails.log({ sorting });
        // query.sort = `${sorting[0]} ${sorting[1]}`;
        sorts = `ORDER BY activation.${sorting[0]} ${sorting[1]}`;
      }

      if (!_.isUndefined(getobj.range)) {
        getobj.range = JSON.parse(getobj.range);
        // query.skip = getobj.range[0];
        // query.limit = getobj.range[1] + 1;
        limits = ` LIMIT ${getobj.range[1]} OFFSET ${getobj.range[0]}`;
      }

      let selectQuery = `
      SELECT activation.*  , pp.title , pp.image as page_img ,COUNT(fan.id) AS totalfans FROM activation 
    LEFT JOIN  fan_activations AS fan ON activation.id = fan.activation_id 
    INNER JOIN published_pages AS pp ON activation.page_id =  pp.page_id 
    ${whereCondition ? whereCondition : " "}
    GROUP BY activation.id , pp.title
    ${sorts ? sorts : " "}
    ${limits ? limits : " "}
      `;

      let selectQueryCount = `
      SELECT activation.*  , pp.title,COUNT(fan.id) AS totalfans FROM activation 
    LEFT JOIN  fan_activations AS fan ON activation.id = fan.activation_id 
    INNER JOIN published_pages AS pp ON activation.page_id =  pp.page_id 
    ${whereCondition ? whereCondition : " "}
    GROUP BY activation.id , pp.title
      `;

      console.log({ selectQuery });

      //   const getWhere = query.where;

      const activations = await sails.models.activations
        .getDatastore()
        .sendNativeQuery(selectQuery);

      const activationsCount = await sails.models.activations
        .getDatastore()
        .sendNativeQuery(selectQueryCount);

      sails.log.debug("user/pages/admin/get-one executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'pages get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Activations found",
        data: activations.rows,
        total: `${activations.rows.length}/${activationsCount.rows.length}`,
      });
    } catch (error) {
      sails.log.error(
        "error at user/pages/admin/get-one error: ",
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
