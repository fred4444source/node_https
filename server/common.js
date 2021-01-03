const m_e = {};

//read command line arguments
m_e.read_command_line_arguments = function(process_obj, argv) {
	process_obj.argv.forEach((v) => {
		if (!v.startsWith('-')) {
			return;
		}
		let a = v.split('=');
		a[0] = a[0].trim().replace(/^[-]*/g, '');
		a[1] = a[1].trim();
		if (argv[a[0]]) {
			if (typeof argv[a[0]] !== typeof a[1]) {
				argv[a[0]] = a[1] - 0;
			} else {
				argv[a[0]] = a[1] - 0;
			}
		}
	});
}

m_e.forEach_async = async function(caller, f) {
	const a = [];
	caller.forEach((currentValue, index, array) => {
		const promise = new Promise(async (resolve, reject) => {
			const r = await f(currentValue, index, array);
			resolve(r);
		});
		a.push(promise);
	});
	return await Promise.allSettled(a);
}

//get location ip
m_e.get_local_ip = () => {
	let ip = [];
	let os = require('os');
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

const content_type_obj = {
	htm : 'text/html; charset=utf-8',
	html : 'text/html; charset=utf-8',
	json : 'text/json; charset=utf-8',
	js	: 'text/javascript; charset=utf-8',
	css : 'text/css; charset=utf-8',
}
m_e.content_type = (type) => {
	return content_type_obj[type];
}

module.exports = m_e;
