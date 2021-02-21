var express = require('express');
var router = express.Router();
const MessageParser = require('./message_parser.js');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('io_spec/index', { title: 'Express' });
});


router.get('/parse', function(req, res, next) {

	console.log(req.query);

	const mp = new MessageParser();
	mp.setUrmSpec('CAR-B-0036_H', 'CAR-B-0036_D', 'CAR-B-0036_T');
	let parsedData = mp.parse(req.query.inputValue);

	res.json({isSuccess:true, urmSpec:mp.getUrmSpecDefine(), resultArray:parsedData});
});

router.get('/spec_define', function(req, res, next) {

	console.log(req.query);

	const mp = new MessageParser();
	mp.setUrmSpec('CAR-B-0038_H', 'CAR-B-0038_D', 'CAR-B-0038_T');
	res.json({isSuccess:true, urmSpec:mp.getUrmSpecDefine()});
});


module.exports = router;


