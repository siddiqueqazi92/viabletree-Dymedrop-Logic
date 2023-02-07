module.exports = {


    friendlyName: 'Invite User confirmation',
  
  
    description: '',
  
  
    inputs: {
      data :{
        type :"ref"
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
  
  