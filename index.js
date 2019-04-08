const https = require('https');
const fs = require('fs');

const g = {
	request_process : null
}
{
	const server_option = {
		key : fs.readFileSync('./pem/private_key.pem'),
		cert : fs.readFileSync('./pem/certificate.pem')
	}

	const https_server = https.createServer(server_option, (request, response) => {
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
	https_server.listen(8080);
}

g.request_process = (o) => {
	console.log(o);
	const {request, response} = o;
	response.writeHead(200);
	response.end('server get request');
}
