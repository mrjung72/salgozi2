
/*-------------------------------------------------------------------------
 *  송수신전문을 정해진 스펙대로 파싱하는 클래스
 *  정형택 2020/05/18
 *-------------------------------------------------------------------------*/
class SndRcvMessageParser {

	getSpecDefineFromDB(type, specId) {

		if(!specId)
			return [];

		if(type === 'H') 

			return [
			    {id:"recDvs", len:1, msg:"레코드구분"}
			   ,{id:"fldrDtm", len:14, msg:"파일생성일시"}
			   ,{id:"rfu", len:5, msg:"RFU"}
			];

		else if(type === 'T' && specId.indexOf('0036') > 0)

			return [
			    {id:"recDvs", len:1, msg:"레코드구분"}
			   ,{id:"totalCount", len:6, msg:"총건수"}
			   ,{id:"rfu", len:13, msg:"RFU"}
			];

		else if(type === 'T')

			return [
			    {id:"recDvs", len:1, msg:"레코드구분"}
			   ,{id:"successCount", len:3, msg:"성공건수"}
			   ,{id:"failCount", len:3, msg:"실패건수"}
			   ,{id:"rfu", len:13, msg:"RFU"}
			];

		else if(type === 'D' && specId.indexOf('0036') > 0) 

			return [
			    {id:"recDvs", len:1, msg:"레코드구분"}
			   ,{id:"seqNum", len:3, msg:"순번"}
			   ,{id:"cardNum", len:6, msg:"카드번호"}
			   ,{id:"amt", len:6, msg:"금액"}
			   ,{id:"rfu", len:4, msg:"RFU"}
			];

		else if(type === 'D') 

			return [
			    {id:"recDvs", len:1, msg:"레코드구분"}
			   ,{id:"cardNum", len:6, msg:"카드번호"}
			   ,{id:"amt", len:6, msg:"금액"}
			   ,{id:"rtnCd", len:1, msg:"결과코드(Y/N)"}
			   ,{id:"rfu", len:6, msg:"RFU"}
			];
	}

	constructor() {
		this.UrmSpecDefine = new Object();
	}


	/* 파싱할 전문의 스펙을 적용한다. */
	setUrmSpec(headSpecId, dataSpecId, tailSpecId) {

		this.UrmSpecDefine.H = this.getSpecDefineFromDB('H', headSpecId);
		this.UrmSpecDefine.D = this.getSpecDefineFromDB('D', dataSpecId);
		this.UrmSpecDefine.T = this.getSpecDefineFromDB('T', tailSpecId);

		this.isHdtSpec = false;
		if(this.UrmSpecDefine.H.length > 0 
			&& this.UrmSpecDefine.T.length > 0)
			this.isHdtSpec = true;

		console.log('isHdtSpec is ' + this.isHdtSpec);
	}


	/* 전체 전문을 정해진 스펙정의에 맞게 파싱한다. */
	parse(message) {

		this.message = message
		this.parsedDatas = new Array();	

		let arrData = new Array();
		arrData = this.getArrayByLen(this.getRowLength(this.UrmSpecDefine.D));

		for(let i=0; i<arrData.length; i++) {
			this.parsedDatas.push(this.parseByRow(arrData[i]));
		}
		return this.parsedDatas;
	}

	/* 전문 타입에 따라 적용할 스펙을 반환한다.*/
	getSpecDefine(rowData, specDefine) {

		if(!this.isHdtSpec)
			return specDefine.D;

		if(rowData.startsWith("H"))
			return specDefine.H;
		else if(rowData.startsWith("T"))
			return specDefine.T;
		else
			return specDefine.D;
	}

	
	/* Row별 길이를 반환한다. (Data Record 데이터를 기준으로 추출한다. ) */
	getRowLength(specInfo) {

		let rowLen = 0;
		for (var i = 0; i < specInfo.length; i++) {
			rowLen += specInfo[i].len;
		}
		return rowLen;
	}

	
	/* row데이터를 스펙에 맞춰서 파싱한다. */
	parseByRow(rowData) {

		let specInfo = this.getSpecDefine(rowData, this.UrmSpecDefine);
		let tempData = rowData;
		let rtnVal = new Object();

		for (var i = 0; i < specInfo.length; i++) {

			let e = specInfo[i];
			let val = tempData.match(new RegExp('.{'+e.len+'}', ''))[0];
			rtnVal[e.id] = val;
			tempData = tempData.substring(e.len);
		}
		return rtnVal;
	}

	
	/* 정해진 길이로 전문을 잘라서 배열로 반환한다. */
	getArrayByLen(len) {

		let str = this.message + "";
		return str.match(new RegExp('.{'+len+'}', 'g'));
	}

	getParsedData() {
		return this.parsedDatas;
	}

	getUrmSpecDefine() {
		return this.UrmSpecDefine;
	}

	printParsedDatas() {
		this.parsedDatas.forEach(function(e, i){
			console.log(e);
		});
	}

}

module.exports = SndRcvMessageParser;