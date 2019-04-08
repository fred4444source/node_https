const os = require('os');
const local_ip = () => {
	let ip = [];
	let network = os.networkInterfaces();
	let a = Object.keys(network);
	let item;
	for (let i = 0, l = a.length; i < l; i++) {
		item = network[a[i]];
		if (item[0].internal) {
			continue;
		} else {
			let ipv4_index, ipv6_index;
			if(item[0].family === 'IPv6') {
				ipv4_index = 1;
				ipv6_index = 0;
			} else {
				ipv4_index = 0;
				ipv6_index = 1;
			}
			ip.push(item[ipv4_index].address);
		}
	}
	return ip;
}
const ip = local_ip()[0];
console.log('ip: ' + ip);
const argv = {
	port : 8080
}
if (os.platform() === 'linux') {
	console.log();
	console.log('open ' + argv.port + ' port once run the two step:');
	console.log('firewall-cmd --add-port=' + argv.port + '/tcp');
	console.log('systemctl restart firewalld');
	console.log();
	console.log('open ' + argv.port + ' port persistent run the two step:');
	console.log('firewall-cmd --permanent --add-port=' + argv.port + '/tcp'); 
	console.log('systemctl restart firewalld');
}

const fs = require('fs');
fs.writeFileSync('debug.sh', `#!/bin/bash
node --inspect=${ip}:9229 index.js`, {
	encoding : 'utf-8',
	mode : 0o777,
	flag : 'w'
});

