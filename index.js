const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const url = require('url');

//IMPORT
const { nuevoRoommate, guardarRoommate } = require('./roommates');

http.createServer((req, res) => {
	//GET HTML
	if (req.url == '/' && req.method == 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		fs.readFile('index.html', 'utf8', (err, html) => {
			if (err) {
				console.log('Error', err);
			}
			res.end(html);
		});
	}
	//ROOMMATES JSON
	let roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
	let roommates = roommatesJSON.roommates;

	//GASTOS JSON
	let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
	let gastos = gastosJSON.gastos;

	//POST ROOMMATE
	if (req.url.startsWith('/roommate') && req.method == 'POST') {
		nuevoRoommate()
			.then(async (user) => {
				guardarRoommate(user);
				res.end(JSON.stringify(user));
				console.log(`Usuario ${user.nombre} registrado con exito`);
			})
			.catch((e) => {
				res.statusCode(500);
				res.end();
				console.log('Error en el registro de un usuario random', e);
			});
	}

	//GET ROOMMATES
	if (req.url.startsWith('/roommates') && req.method == 'GET') {
		res.end(JSON.stringify(roommatesJSON));
	}

	//GET GASTOS
	if (req.url.startsWith('/gastos') && req.method == 'GET') {
		res.end(JSON.stringify(gastosJSON));
	}

	//POST GASTO
	if (req.url.startsWith('/gasto') && req.method == 'POST') {
		let body;

		req.on('data', (chunk) => {
			body = JSON.parse(chunk);
		});

		req.on('end', () => {
			let gasto = {
				id: uuidv4().slice(30),
				roommate: body.roommate,
				descripcion: body.descripcion,
				monto: body.monto,
			};

			gastos.push(gasto);

			fs.writeFile('gastos.json', JSON.stringify(gastosJSON), (err) => {
				err ? console.log('Oh no!...') : console.log('OK');

				let montoAcumulado = 0;
				gastos.forEach((m) => {
					if (m.roommate == gasto.roommate) {
						montoAcumulado += m.monto;
					}
					roommates.forEach((r) => {
						if (r.nombre == gasto.roommate) {
							r.debe = montoAcumulado;

							fs.writeFileSync(
								'roommates.json',
								JSON.stringify(roommatesJSON),
								(err) => {
									err ? console.log('Oh no!...') : console.log('OK');
								}
							);
						}
					});
				});

				res.end();
				console.log('Gasto creado con exito');
			});
		});
	}

	//PUT GASTO
	if (req.url.startsWith('/gasto') && req.method == 'PUT') {
		let body;

		const { id } = url.parse(req.url, true).query;

		req.on('data', (chunk) => {
			body = JSON.parse(chunk);
			body.id = id;
		});

		req.on('end', () => {
			gastosJSON.gastos = gastos.map((g) => {
				if (g.id == body.id) {
					return body;
				}
				return g;
			});

			fs.writeFile('gastos.json', JSON.stringify(gastosJSON), (err) => {
				err ? console.log('Oh no!...') : console.log('OK');

				let montoAcumulado = 0;
				gastosJSON.gastos.forEach((m) => {
					if (m.roommate == body.roommate) {
						montoAcumulado += m.monto;
					}
					roommates.forEach((r) => {
						if (r.nombre == body.roommate) {
							r.debe = montoAcumulado;

							fs.writeFileSync(
								'roommates.json',
								JSON.stringify(roommatesJSON),
								(err) => {
									err ? console.log('Oh no!...') : console.log('OK');
								}
							);
						}
					});
				});

				res.end();
				console.log('Gasto actualizado con exito');
			});
		});
	}

	//DELETE GATO
	if (req.url.startsWith('/gasto') && req.method == 'DELETE') {
		const { id } = url.parse(req.url, true).query;

		let reduce = gastos.find((g) => g.id == id);

		gastosJSON.gastos = gastos.filter((g) => g.id !== id);

		fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON));

		roommates.forEach((r) => {
			if (r.nombre == reduce.roommate) {
				r.debe -= reduce.monto;

				fs.writeFileSync('roommates.json', JSON.stringify(roommatesJSON), (err) => {
					err ? console.log('Oh no!...') : console.log('OK');
				});
			}
		});

		res.end();
		console.log('Gasto eliminado con exito');
	}
}).listen(3000, console.log('SERVER ON'));
