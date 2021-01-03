const m_e = {};

const fs = require('fs');

const current_project = {
	common : require('./common'),
};

//read local file content as the response body
m_e.request_static_file = ({process_obj, request, response, server_dir_path, config}) => {
	try {
		let url_s = request.url.toString();
		if (url_s === '' || url_s === '/') {
			//url_s = '/client/index.html';
			url_s = config.default_path;
		}
		//let file_path = '.' + url_s;
		let file_path = server_dir_path + url_s;
		if (!fs.existsSync(file_path)) {
			//file_path = './src/client' + url_s;
			file_path = server_dir_path + '/client' + url_s;
			if (!fs.existsSync(file_path)) {
				file_path = null;
			}
		}
//console.log(file_path);
		if (file_path) {
			fs.readFile(file_path, (err, data) => {
				if (err) throw err;
				//response.write(data);
				const ext = url_s.split('.');
				if (ext.length === 2) {
					let content_type = current_project.common.content_type(ext[1].toLowerCase());
					if (content_type) {
					} else {
						content_type = 'application/octet-stream';
					}
					response.setHeader('Content-Type', content_type);
				}
				response.end(data);
				return;
			});
			return true;
		}
		return false;
	} catch (e) {
		console.log('in request_static_file method got error:');
		console.log(e);
	}
}

module.exports = m_e.request_static_file;
