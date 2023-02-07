/**
 * Activations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "activation",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    user_id: {
      type: "string",
      required: true,
    },
    activation_name: {
      type: "string",
      required: true,
    },
    activation_price: {
      type: "number",
      required: true,
    },
    activation_frequency: {
      type: "string",
      required: true,
    },
    activation_description: {
      type: "string",
      required: true,
    },
    activation_scanlimit: {
      type: "string",
      required: true,
    },
    activation_fanlimit: {
      type: "string",
      required: true,
    },
    activation_promocode: {
      type: "string",
      required: false,
    },
    published: {
      type: "number",
      required: false,
    },
    page_id: {
      model: "page",
      // required :true
    },
    is_deleted: {
      type: "number",
      //  required :true
    },
    fanActivation: {
      collection: "fan_activations",
      via: "activation_id",
    },
    // deletedAt :{
    //     type :"string",
    //   //  required :true
    // }
  },
  getActivationCount: async function (user_id) {
    let data = 0;
    try {
      let query = `
          SELECT  COUNT(s.id) AS activation_count
          FROM sales s
          INNER JOIN fan_activations fa ON fa.id = s.fan_or_guest_activation_id 
          INNER JOIN activation a ON fa.activation_id = a.id          
          WHERE a.user_id = '${user_id}'
          AND  s.is_guest = FALSE
          AND s.createdAt >= DATE(NOW() - INTERVAL 7 DAY) 
          `;
      console.log(query);
      let result = await sails.sendNativeQuery(query);
      data = result.rows.length ? result.rows[0].activation_count : 0;
      query = `
          SELECT  COUNT(s.id) AS activation_count
          FROM sales s
          INNER JOIN guest_activations fa ON fa.id = s.fan_or_guest_activation_id 
          INNER JOIN activation a ON fa.activation_id = a.id          
          WHERE a.user_id = '${user_id}'
          AND  s.is_guest = TRUE
          AND s.createdAt >= DATE(NOW() - INTERVAL 7 DAY) 
          `;
      console.log(query);
      result = await sails.sendNativeQuery(query);
      data = result.rows.length ? result.rows[0].activation_count + data : data;
    } catch (err) {
      sails.log.error(
        `Error in model Activations, function getActivationCount. ${err}`
      );
    }
    return data;
  },
};
