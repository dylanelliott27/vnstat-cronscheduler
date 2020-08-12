# Cron-job scheduler for VNstat
### Purpose of this application
Dealing with bandwith limits from VPS hosts and wanting to avoid overages, this application runs in the background on my linux VPS and executes a cron job
every day at 8AM, which is vnstat in a childprocess to pull the overall outbound bandwith amount.

Once the bandwith amount is half of the limit, an email is sent to inform of the amount.

This app uses node-cron for the scheduling and nodemailer for sending the emails

### How to use
Require the module file, then instantiate an instance of the outboundtrafficmonitor object with the options as per the specification below.

```javascript
const outboundTrafficMonitor = require('./src/outboundtrafficmonitor');
```


```javascript
let monitor = new outboundTrafficMonitor(options);
monitor.initialize();
```
### Options
| Command | Description |
| --- | --- |
| `schedule` | Cron schedule expression (defaults to everyday 8am) |
| `logfile` | **TRUE/FALSE** creates logfile with each result in root dir |
| `emailbody` | **FROM, TO, SUBJECT & TEXT** subject & text default to message stating current mbs if empty |
| `emailcredentials` | **EMAIL,PASSWORD,SERVER,HOSTNAME,PORT** MUST either have server or hostname + port.|

```javascript
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
```

### Dependencies

I am using both node-cron and nodemailer in this application. you can find a link to their repo and their license in the license-3rd-party.txt file
