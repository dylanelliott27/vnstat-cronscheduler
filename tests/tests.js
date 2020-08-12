const outboundTrafficMonitor = require('../src/outboundtrafficmonitor.js');
const fs = require('fs');


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

let testInstance = new outboundTrafficMonitor(options);
var errorCount = 0;

(async function runTests(){
	await verifyEmailAlertActuallySends();
	await verifyEmailSentIfBandwidth500gb();
})()

function verifyEmailAlertActuallySends(){
	return new Promise(function(resolve){
		testInstance.sendEmailAlert(7775);

		setTimeout(function(){	
			let logs = fs.readFileSync('log.txt').toString().split("\n");
			//TODO: fix \n formatting so .length isnt grabbing empty last line & change to length - 1
			if(logs[logs.length - 2].includes('ERROR')){
				console.log('~~~~ E-MAIL SEND TEST RESULT: FAIL ~~~~~');
				errorCount++;
				resolve();
			}
			else{
				console.log('~~~~ E-MAIL SEND TEST RESULT: PASS ~~~~~');
				resolve();
			}
		}, 3000);
	})
	
}

function verifyEmailSentIfBandwidth500gb(){
	return new Promise(function(resolve){
		let testObject = {
			interfaces : [
				{
					traffic: {
						total: {
							tx : 500000000001
						}
					}
				}
			]
		}
		testInstance.parseData(JSON.stringify(testObject));

		setTimeout(function(){
			let logs = fs.readFileSync('log.txt').toString().split("\n");
			//TODO: fix \n formatting so .length isnt grabbing empty last line & change to length - 1
			if(logs[logs.length - 3].includes('WARNING')){
				console.log('~~~~ BANDWITH 500GB EMAIL TEST RESULT: PASS ~~~~');
				resolve();
			}
			else{
				console.log('~~~~ BANDWITH 500GB EMAIL TEST RESULT: FAIL ~~~~');
				resolve();
				errorCount++;
			}
		}, 3000)
	})
}
