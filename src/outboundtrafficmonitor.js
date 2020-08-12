const {exec} = require('child_process');
const nodemailer = require('nodemailer');
const {CronJob} = require('cron');
const fs = require('fs');

function outboundTrafficMonitor(options){
	if(typeof(options) != 'object'){
		throw new Error('Options supplied to constructor must be in form of an object');	
	}
	if(!options.emailcredentials.server && !options.emailcredentials.host && !options.emailcredentials.port){
		throw new Error('You must supply either a servername or hostname + port');
	}
	if(!options.emailcredentials.email || !options.emailcredentials.password){
		throw new Error('Missing username or password for email');
	}
	this.schedule = options.schedule || '0 0 8 * * *';
	this.emailcredentials = {email: options.emailcredentials.email, password: options.emailcredentials.password};
	this.emailbody = options.emailbody;
	this.logFile = options.logfile || true;
	this.connectionInfo = options.emailcredentials.server || {hostname: options.emailcredentials.host, port: options.emailcredentials.port};
	this.networkData = null;
}


outboundTrafficMonitor.prototype.initialize = function(){
	var job = new CronJob(
		this.schedule,
		this.getCurrentData.bind(this),
		null,
		true
	)
	console.log('intiaialized');
}


outboundTrafficMonitor.prototype.getCurrentData = function(){
	var netstatTraffic = exec('vnstat --json', (err, stdout, stderr) => {
		if(err){
			console.log(err)
		}
		this.networkData = stdout;
		this.parseData(this.networkData);
	})	
}


outboundTrafficMonitor.prototype.parseData = function(data){
	try{
		var dataInJson = JSON.parse(data);	
	}
	catch(error){
		throw error;
	}

	let sentTrafficInBytes = dataInJson.interfaces[0].traffic.total.tx;
	if(typeof(sentTrafficInBytes) != 'number'){
		throw new Error('sent traffic is not a valid number');	
	}
	
	if(sentTrafficInBytes > 500000000000){
		this.emailbody.subject = `WARNING: currently at: ${(sentTrafficInBytes / (1024*1024).toFixed(2))}`;
		this.sendEmailAlert(sentTrafficInBytes);
		this.writeToLogFile(null, `WARNING: ${new Date().toDateString()} ~~~~ outbound data measured: ${(sentTrafficInBytes / (1024 * 1024).toFixed(2))}`);
	}
	else{
		console.log('in good shape');
		this.writeToLogFile(sentTrafficInBytes);
		this.sendEmailAlert(sentTrafficInBytes);		
	}
}

outboundTrafficMonitor.prototype.sendEmailAlert = function(currentBandwith){
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: this.emailcredentials.email,
			pass: this.emailcredentials.password
		}
	})

	const mailOptions = {
		from: this.emailbody.from,
		to: this.emailbody.to,
		subject: this.emailbody.subject ||  `Outbound bandwith: ${(currentBandwith / (1024*1024)).toFixed(2)} mb`,
		text: this.emailbody.text ||  `Outbound bandwith: ${(currentBandwith / (1024*1024)).toFixed(2)} mb`
	}

	transporter.sendMail(mailOptions, function(err, info){
		if(err){
			console.log(err);
			this.writeToLogFile(0, 'ERROR');
		}
		else{
			console.log('email sent' + info.response);
			this.writeToLogFile(0, 'SUCCESS: E-mail delivered');
		}
	}.bind(this))
}

outboundTrafficMonitor.prototype.writeToLogFile = function(measuredData, notification){
	let logString = `${new Date().toDateString()} ~~~~ outbound data measured: ${(measuredData / (1024*1024)).toFixed(2)} \n`;
	fs.appendFile('log.txt', notification ? `${notification} \n` : logString, err => {
		if (err) throw err;
		console.log('wrote to log file');
 	 })
}

module.exports = outboundTrafficMonitor;








