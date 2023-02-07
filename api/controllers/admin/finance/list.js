const moment = require("moment");

module.exports = {
  friendlyName: "Get listing finance",

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
    filter: {
      type: "string",
    },
    obj: {
      type: "ref",
    },
    search: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/pages/admin/pages/activations/activations\ntime: ",
      moment()
    );

    try {
      let inputFilter = JSON.parse(inputs.obj);
      let filters;
      let sortings;
      inputFilter.filter = JSON.parse(inputFilter.filter);
      if (inputFilter.filter) {
        console.log("==>frequency");
        Object.keys(inputFilter.filter).forEach((val) => {
          sails.log(val, "==>");
          if (val == "creator_id") {
            filters = `WHERE creator.user_id = '${inputFilter.filter[val]}'`;
          } else if (val == "pass_id") {
            filters = `WHERE pp.page_id = '${inputFilter.filter[val]}'`;
          } else if (val == "fan_id") {
            // ('${inputFilter.filter[val].join('\',\'')}')
            filters = `WHERE fan.user_id = '${inputFilter.filter[val]}' `;
          } else if (val == "activation_id") {
            filters = `WHERE ac.id = ${inputFilter.filter[val]} `;
          } else if (val == "activation_frequency") {
            sails.log("Activation Frequency");
            if (inputFilter.filter[val] != "all") {
              filters = `WHERE ac.activation_frequency ='${inputFilter.filter.activation_frequency}'`;
            }
          } else if (val == "search") {
            filters = `WHERE creator.first_name LIKE '%${inputFilter.filter[val]}%' OR fan.first_name LIKE '%${inputFilter.filter[val]}%'  OR ac.activation_name LIKE '%${inputFilter.filter[val]}%' OR pp.title LIKE '%${inputFilter.filter[val]}%' `;
          }
        });
      }

      if (inputFilter.sort) {
        const s = JSON.parse(inputFilter.sort);
        sorting = `ORDER BY ${s[0]} ${s[1]}`;
      }
      if (inputFilter.sort) {
        const s = JSON.parse(inputFilter.sort);
        sorting = `ORDER BY ${s[0]} ${s[1]}`;
      }
      let limit = " LIMIT 10 OFFSET 0";
      if (!_.isUndefined(inputFilter.range)) {
        inputFilter.range = JSON.parse(inputFilter.range);

        limit = ` LIMIT ${inputFilter.range[1]} OFFSET ${inputFilter.range[0]}`;
      }
      filters = filters
        ? ` AND s.is_guest = FALSE`
        : `WHERE s.is_guest = FALSE`;
      const query = `SELECT 
        s.id, s.createdAt as purchased_at,s.total,s.creator_share,s.admin_share , fan.user_id AS fan_id , fan.first_name  AS fan_name ,fan.avatar AS fan_avatar, 
        creator.user_id AS creator_id , creator.first_name AS creator_name , creator.avatar AS creator_avatar,
        ac.activation_name  as activation_name , ac.id AS activation_id , ac.activation_price AS activation_price , ac.activation_frequency AS activation_frequency,
        pp.title , pp.page_id as pass_id ,pp.image as page_img
        FROM sales  AS s
        INNER JOIN fan_activations fa ON fa.id = s.fan_or_guest_activation_id 
        INNER JOIN users AS fan ON fan.user_id = fa.fan_user_id 
        INNER JOIN activation AS ac ON ac.id = s.activation_id
        INNER JOIN users AS creator ON creator.user_id = ac.user_id
        INNER JOIN published_pages AS pp ON pp.page_id = ac.page_id 
        ${filters ? filters : ""}
        ${sorting ? sorting : ""}
        ${limit}
        `;

      const totalQuery = `SELECT COUNT(s.id) AS total_rows
        FROM sales  AS s
        INNER JOIN fan_activations fa ON fa.id = s.fan_or_guest_activation_id 
        INNER JOIN users AS fan ON fan.user_id = fa.fan_user_id 
        INNER JOIN activation AS ac ON ac.id = s.activation_id
        INNER JOIN users AS creator ON creator.user_id = ac.user_id
        INNER JOIN published_pages AS pp ON pp.page_id = ac.page_id 
        ${filters ? filters : ""}
        `;
      console.log(query);

      const financeList = await sails.models.fan_activations
        .getDatastore()
        .sendNativeQuery(query);
      const countFinanceList = await sails.models.fan_activations
        .getDatastore()
        .sendNativeQuery(totalQuery);

      // financeList.rows.map((data) => {
      //   data.creator_share = (data.activation_price / 100) * 90;
      //   data.admin_share = (data.activation_price / 100) * 10;
      // });

      sails.log.debug("/admin/finance executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'pages get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Activations found",
        data: financeList.rows,
        total: `${financeList.rows.length}/${
          countFinanceList.rows.length > 0
            ? countFinanceList.rows[0].total_rows
            : 0
        }`,
      });
    } catch (error) {
      sails.log.error(
        "error at admin/finance error: ",
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
