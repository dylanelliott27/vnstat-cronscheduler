const outboundTrafficMonitor = require('./src/outboundtrafficmonitor');

let options = {
	schedule: '0 * * * * *',
	logfile: true,
	emailbody: {
		from: 'dylansemailwarn@gmail.com',
		to: 'dylanelliott27@hotmail.com'
	},
	emailcredentials: {
		email: '',
		password: '',
		server: 'Gmail'
	}
}
let monitor = new outboundTrafficMonitor(options);

monitor.initialize();








