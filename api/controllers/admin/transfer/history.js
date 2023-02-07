const moment = require("moment");

module.exports = {
  friendlyName: "Get listing Transfer",

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
    sails.log.debug("calling admin/transfer/history\ntime: ", moment());

    try {
      let inputFilter;
      if (inputs.obj) {
        inputFilter = JSON.parse(inputs.obj);
      }
      let filters;
      let sortings;

      if (inputFilter.filter) {
        inputFilter.filter = JSON.parse(inputFilter.filter);
        console.log("==>frequency");
        // Object.keys(inputFilter.filter).forEach((val) => {
        //   sails.log(val, "==>");
        //   if (val == "creator_id") {
        //     filters = `WHERE creator.user_id = '${inputFilter.filter[val]}'`;
        //   } else if (val == "pass_id") {
        //     filters = `WHERE pp.page_id = '${inputFilter.filter[val]}'`;
        //   } else if (val == "guest_id") {
        //     // ('${inputFilter.filter[val].join('\',\'')}')
        //     filters = `WHERE guest.user_id = '${inputFilter.filter[val]}' `;
        //   } else if (val == "activation_id") {
        //     filters = `WHERE ac.id = ${inputFilter.filter[val]} `;
        //   } else if (val == "activation_frequency") {
        //     sails.log("Activation Frequency");
        //     if (inputFilter.filter[val] != "all") {
        //       filters = `WHERE ac.activation_frequency ='${inputFilter.filter.activation_frequency}'`;
        //     }
        //   } else if (val == "search") {
        //     filters = `WHERE creator.first_name LIKE '%${inputFilter.filter[val]}%' OR guest.last_name LIKE '%${inputFilter.filter[val]}%'  OR ac.activation_name LIKE '%${inputFilter.filter[val]}%' OR pp.title LIKE '%${inputFilter.filter[val]}%' `;
        //   }
        // });
      }

      if (inputFilter.sort) {
        const s = JSON.parse(inputFilter.sort);
        sortings = `ORDER BY ${s[0]} ${s[1]}`;
      }
      let limit = " LIMIT 10 OFFSET 0";
      if (!_.isUndefined(inputFilter.range)) {
        inputFilter.range = JSON.parse(inputFilter.range);

        limit = ` LIMIT ${inputFilter.range[1]} OFFSET ${inputFilter.range[0]}`;
      }
      const query = `SELECT transfers.id , transfers.user_id AS user_id , transfers.page_id AS page_id , transfers.activation_id AS activation_id , transfers.amount ,
      pp.title ,ac.activation_name, users.first_name , users.last_name, users.full_name
      FROM transfers 
      INNER JOIN users ON transfers.user_id = users.user_id
      LEFT JOIN published_pages AS pp ON transfers.page_id = pp.page_id
      LEFT JOIN activation AS ac ON transfers.activation_id = ac.id
        ${filters ? filters : ""}
        ${sortings ? sortings : ""}
        ${limit}
        `;

      const totalQuery = `SELECT transfers.id , transfers.user_id AS user_id , transfers.page_id AS page_id , transfers.activation_id AS activation_id , transfers.amount ,
      pp.title ,ac.activation_name , users.first_name , users.last_name, users.full_name
      FROM transfers 
      INNER JOIN users ON transfers.user_id = users.user_id
      LEFT JOIN published_pages AS pp ON transfers.page_id = pp.page_id
      LEFT JOIN activation AS ac ON transfers.activation_id = ac.id
        `;
      console.log(query);

      const transferList = await sails.sendNativeQuery(query);
      const counttransferList = await sails.sendNativeQuery(totalQuery);

      sails.log.debug("/admin/transfer executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'pages get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Trasfer Listing Found",
        data: transferList.rows,
        total: `${counttransferList.rows.length}/${transferList.rows.length}`,
      });
    } catch (error) {
      sails.log.error(
        "error at admin/transfer/list error: ",
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
