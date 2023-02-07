module.exports = {


  friendlyName: 'Fix double value',


  description: '',


  inputs: {
    value: {
      type: 'number',
      required: true
    },
    precision:{
      type: 'number',
      required: false,
      defaultsTo: 2
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    return exits.success(parseFloat(inputs.value.toFixed(inputs.precision)));
  }


};

