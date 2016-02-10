'use strict'

const nodeStatic = require('node-static');

const fileServer = new nodeStatic.Server('./files', {cache:10});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
		setTimeout(function(){
			fileServer.serve(request, response);
    },2000)
    }).resume();
}).listen(8081);
