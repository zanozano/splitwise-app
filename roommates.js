const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

//NEW ROOMMATE
const nuevoRoommate = async () => {
	//PASS
	try {
		const { data } = await axios.get('https://randomuser.me/api');
		const roommate = data.results[0];
		const user = {
			id: uuidv4().slice(30),
			nombre: `${roommate.name.title} ${roommate.name.first} ${roommate.name.first}`,
			debe: 0,
			recibe: 0,
		};
		return user;

		//ERROR
	} catch (e) {
		throw e;
	}
};

//SAVE ROOMMATE
const guardarRoommate = (user) => {
	const roommatesJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
	roommatesJSON.roommates.push(user);
	fs.writeFileSync('roommates.json', JSON.stringify(roommatesJSON));
};

//EXPORT
module.exports = { nuevoRoommate, guardarRoommate };
