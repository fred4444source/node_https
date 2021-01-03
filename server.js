const g = {
	node_module : {
		path : require('path'),
		fs : require('fs'),

		net : require('net'),
		https : require('https'),
		http : require('http'),
	},
	third_module : {
	},
	local_module : {
		config : require('./config.js'),
		common : require('./server/common'),
		//process_action : require('./src/server/process_action'),
		request_static_file : require('./server/request_static_file'),
	},
	current : {
		variables : {
			argv : {
				https_port : 10002,
				http_port : 10001,
				net_port : 8088,
			}
		},
		functions : {
			request_process : null
		},
	},
}

g.local_module.common.read_command_line_arguments(process, g.current.variables.argv);

g.request_process = async (o) => {
	const {request, response} = o;
	const headers = request.headers;
	const method = request.method;
	let url = request.url;

	const common_parameter = {
		process_obj : process,
		request,
		response,
		server_dir_path : __dirname,
		config : g.local_module.config,
	};
	//action for ajax
	if (url.indexOf('action') !== -1) {
		current_project.process_action(common_parameter);
		return;
	}

	if (await g.local_module.request_static_file(common_parameter)) {
		return;
	}

	response.writeHead(200);
	response.end('server get request');
}

const https_start = async function() {
	try {
		const nm = g.node_module;
		const fs = nm.fs;
		const https = nm.https;

		const server_option = {
			key : fs.readFileSync('./pem/private_key.pem'),
			cert : fs.readFileSync('./pem/certificate.pem')
		}

		const server = https.createServer(server_option, (request, response) => {
			try {
				return g.request_process({
					request : request,
					response : response
				});
			} catch (e) {
				console.log(request);
				console.log(response);
				console.log(e);
				response.writeHead(400);
				response.end('server error');
			}
		});
		server.listen(g.current.variables.argv.https_port);
		return {
			success : true,
			server : server,
		}
	} catch (e) {
		return {
			success : false,
			error : e,
		};
	}
}

const http_start = async function() {
	try {
		const nm = g.node_module;
		const http = nm.http;

		const server = http.createServer((request, response) => {
			try {
				return g.request_process({
					request : request,
					response : response
				});
			} catch (e) {
				console.log(request);
				console.log(response);
				console.log(e);
				response.writeHead(400);
				response.end('server error');
			}
		});
		server.listen(g.current.variables.argv.http_port);
		return {
			success : true,
			server : server,
		}
	} catch (e) {
		return {
			success : false,
			error : e,
		};
	}
}

const net_start = async function() {
	try {
		const nm = g.node_module;
		const net = nm.net;
		const argv = g.current.variables.argv;

		const server = net.createServer((connection) => {//connection is net.Socket instance
			try {
				const socket = connection;
				let type = 'http';

				socket.on('error', (e) => {
					throw e;
				});

				socket.once('data', (buffer) => {
					//https数据流的第一位是十六进制“16”，转换成十进制就是22
					type = buffer[0] === 22 ? 'https' : 'http';

					const proxy = net.createConnection(argv[type + '_port'], 'localhost');

					proxy.on('error', (e) => {
						throw e;
					});

					proxy.on('connect', () => {
						proxy.write(buffer);
						//反向代理的过程，tcp接受的数据交给代理链接，代理链接服务器端返回数据交由socket返回给客户端
						socket.pipe(proxy);
						proxy.pipe(socket);
					});
				});
			} catch (e) {
				console.log(connection);
				console.log(e);
				response.writeHead(400);
				response.end('server error');
			}
		});
		server.listen(g.current.variables.argv.net_port);
		return {
			success : true,
			server : server,
		}
	} catch (e) {
		return {
			success : false,
			error : e,
		};
	}
}


const print_start_message = async function() {
	const lm = g.local_module;
	const argv = g.current.variables.argv;
	const current_path = g.node_module.path.resolve('./');
	process.stdout.write('\033c');
	console.log('./ path is:');
	console.log(current_path);
	console.log('process.execPath is:');
	console.log(process.execPath);
	console.log('process.cwd() is:');
	console.log(process.cwd());
	process.stdout.write('-port=\033[36m' + argv.net_port + ' \033[0m');
	console.log('listening on \033[36m' + lm.common.get_local_ip() + ':' + argv.net_port + '\033[0m');
	if (require('os').platform() === 'linux') {
		console.log();
		console.log('open \033[36m' + argv.net_port + '\033[0m port once run the two step:');
		console.log('\033[32mfirewall-cmd --add-port=' + argv.net_port + '/tcp');
		console.log('systemctl restart firewalld\033[0m');
		console.log();
		console.log('open \033[36m' + argv.net_port + '\033[0m port persistent run the two step:');
		console.log('\033[32mfirewall-cmd --permanent --add-port=' + argv.net_port + '/tcp');
		console.log('systemctl restart firewalld\033[0m');
	}
}

const main = async function(argv) {
	process.stdout.write('\033c');
	let step = null;
	step = await https_start();
	if (step.success) {
	} else {
		console.log(step);
	}
	step = await http_start();
	if (step.success) {
	} else {
		console.log(step);
	}
	step = await net_start();
	if (step.success) {
		print_start_message();
	} else {
		console.log(step);
	}
}
main();
