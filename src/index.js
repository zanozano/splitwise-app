const functions = require('firebase-functions');
const { createApp } = require('./server');

exports.app = functions.https.onRequest(createApp());
