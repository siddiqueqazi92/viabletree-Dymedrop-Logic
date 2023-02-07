

module.exports.cron = {
	myFirstJob: {
	  schedule: '0 */10 * * * *',//runs every 5 minutes
	//   schedule: '* * * * * *',
		onTick: async function () {
			console.log("cron running at: ",new Date())
            await sails.helpers.cron.processOnetimeSubscriptions();
		
		},
		start: true, // Start task immediately
	}
  };