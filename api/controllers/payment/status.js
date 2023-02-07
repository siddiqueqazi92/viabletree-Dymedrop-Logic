const lodash = require("lodash");
module.exports = {
  friendlyName: "Payment",

  description: "Payment Status",

  inputs: {
    user: {
      type: "ref",
      require: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    notFound: {
      responseType: "notFound",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug("Action payment/status started");
    try {
      let user = await sails.models.user.find({
        user_id: inputs.user.id,
      });
      if (user.length < 1) {
        return exits.success({
          status: false,
          message: "No user found.",
        });
      }
      let status;
      if (user[0].account_setup == 0) {
        status = false;
      } else {
        status = true;
      }
      const activations = await sails.models.activations.find({
        user_id: user[0].user_id,
      });
      let activationsIds = _.map(activations, "id");
      let list = [];
      if (activationsIds.length > 0) {
        //   let query = `SELECT activation.id AS activation_id ,activation.activation_price AS activation_price,
        //   fan_activations.id as id , fan_activations.fan_user_id AS fan_id , fan_activations.createdAt ,
        //   users.first_name AS first_name ,  users.last_name AS last_name, users.avatar AS avatar
        //   FROM fan_activations INNER JOIN users ON
        //  fan_activations.fan_user_id = users.user_id
        //  INNER JOIN activation ON
        //  fan_activations.activation_id = activation.id
        //  WHERE activation.id IN ('${activationsIds.join("','")}')
        //  ORDER BY fan_activations.createdAt DESC`;
        let query = `SELECT a.id AS activation_id ,a.activation_price AS activation_price,
        s.id AS id , fa.fan_user_id AS fan_id , s.createdAt ,
        u.first_name AS first_name ,  u.last_name AS last_name, u.avatar AS avatar
        FROM sales s 
        INNER JOIN fan_activations fa ON fa.id = s.fan_or_guest_activation_id 
        INNER JOIN users u ON fa.fan_user_id = u.user_id 
       INNER JOIN activation a ON fa.activation_id = a.id
       WHERE a.id IN ('${activationsIds.join("','")}')
       ORDER BY s.createdAt DESC
       
       `;
        console.log(query);
        let getList = await sails.sendNativeQuery(query);
        list = getList.rows;

        //#region guest activations sales
        query = `SELECT a.id AS activation_id ,a.activation_price AS activation_price,
        s.id AS id , fa.guest_user_id AS fan_id , s.createdAt ,
        u.first_name AS first_name ,  u.last_name AS last_name, NULL AS avatar
        FROM sales s 
        INNER JOIN guest_activations fa ON fa.id = s.fan_or_guest_activation_id 
        INNER JOIN guestusers u ON fa.guest_user_id = u.id 
       INNER JOIN activation a ON fa.activation_id = a.id
       WHERE a.id IN ('${activationsIds.join("','")}')
       ORDER BY s.createdAt DESC
       
       `;
        console.log(query);
        getList = await sails.sendNativeQuery(query);

        // list = _.merge({ ...list, ...getList.rows });

        if (getList.rows.length) {
          // list = _.union(list, getList.rows);

          // list = _.sortBy(list, (o) => {
          //   return o.createdAt;
          // });
          // list = _.orderBy(list, ["createdAt"], ["desc"]);

          list = lodash.unionBy(list, getList.rows, "createdAt");
          list = lodash.orderBy(list, ["createdAt"], ["desc"]);
          console.log({ list });
        }

        //#endregion
      }
      let stripe_balance = 0;
      let available_amount = 0;
      let balance_response = await sails.helpers.stripe.balance.get(
        user[0].account_id
      );
      if (
        !_.isUndefined(balance_response.balance) &&
        !_.isUndefined(balance_response.balance.available) &&
        balance_response.balance.available.length
      ) {
        available_amount = balance_response.balance.available[0].amount / 100;
      }
      if (
        !_.isUndefined(balance_response.balance) &&
        !_.isUndefined(balance_response.balance.available) &&
        balance_response.balance.pending.length
      ) {
        stripe_balance = balance_response.balance.pending[0].amount / 100;
      }
      return exits.success({
        status: true,
        message: "Payment successfully found.",
        data: {
          totalEarning:
            user[0].total_earnings != "" ? user[0].total_earnings : "0",
          available_amount,
          stripe_balance,
          weeklyActivations: await Activations.getActivationCount(
            user[0].user_id
          ),
          paymentStatus: status,
          recent_sales: list,
        },
      });
    } catch (error) {
      return exits.success({
        status: false,
        message: error.message,
      });
    }
  },
};
