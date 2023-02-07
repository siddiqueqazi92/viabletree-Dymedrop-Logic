const { generateOtp } = require('../../util')
module.exports = {


  friendlyName: 'upload profile image',


  description: '',


  inputs: {
    user:{
        type:"ref"
    },
    image_url: {
      type: 'string',
      required: true,
      
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    sails.log.debug('calling send-opt');
    try{

      const user = await sails.models.user.updateOne({user_id:inputs.user.id}).set({
        avatar:inputs.image_url
      });
      if(!user) {
        throw new Error('User not exists.');
      }
      user.profilePic = user.image_url
      return exits.success({status: true, data: user, message:'profile image updated'});
    }catch(e){
      sails.log.debug('error sending otp ', e);
      return exits.success({status: false, data: [], message: e.message || 'Error sending OTP.'});
    }

  }


};
