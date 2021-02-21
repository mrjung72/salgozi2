const MessageParser = require('./message_parser.js');

const tempData = "H2020051814532100000D001101001002000    D002101101003000    D003101915002500    T0000000000000000000";

const mp = new MessageParser();
mp.setInSpec('CAR-B-0036_H', 'CAR-B-0036_D', 'CAR-B-0036_T');
// mp.setInSpec('', 'CAR-B-0036_D', '');
mp.setOutSpec('CAR-B-0038_H', 'CAR-B-0038_D', 'CAR-B-0038_T');
mp.parse(tempData);
mp.printParsedDatas();