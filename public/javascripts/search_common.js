
function searchDatas(categoryId, resultBlockId, str_params, sort_column) {

  let param_values = new Object();
  try {
    // String타입의 속성값을 객체로 변환한다.
    param_values = JSON.parse(str_params);
  } catch (error) {
    console.log(error);
  }

  let sval = $("#search_value_"+categoryId).val();
  let cname = $("#search_column_"+categoryId+" option:selected").val();
  let gnum = $("#gnum option:selected").val();
  let basicParam = {
          gnum:gnum
        , col_name:cname
        , svalue:sval
  };

  if(sort_column) {
    param_values.sort_column = BlockDefine[categoryId].columns[sort_column].search_column;
    param_values.sort_by = getSortTypeByColumn(categoryId, sort_column);
    $("#sort_column_"+categoryId).val(param_values.sort_column);
    $("#sort_by_"+categoryId).val(param_values.sort_by);
  }
  let totParamValues = Object.assign(basicParam, param_values);
  callAjaxProtocol(categoryId, totParamValues, resultBlockId);
}

function getSortTypeByColumn(categoryId, orderbycolumn) {

  let orderby = "asc";
  if(orderbycolumn) {

    if(BlockDefine[categoryId].columns[orderbycolumn].orderby === "asc") {
      orderby = "desc";
      BlockDefine[categoryId].columns[orderbycolumn].orderby = "desc";
    }
    else 
      BlockDefine[categoryId].columns[orderbycolumn].orderby = "asc";
  }

  return orderby;
}


function callAjaxProtocol(categoryId, selectParams, resultBlockId) {

  if(!selectParams.col_name) {
    selectParams.col_name = $("#search_column_"+categoryId).val();
    selectParams.svalue = $("#search_value_"+categoryId).val();
  }
  if(selectParams.sort_column){
    $("#sort_column_"+categoryId).val(selectParams.sort_column);
    $("#sort_by_"+categoryId).val(selectParams.sort_by);
  }
  else {
    selectParams.sort_column = $("#sort_column_"+categoryId).val();
    selectParams.sort_by = $("#sort_by_"+categoryId).val();
  }

  $.ajax({
    url:'/salgozi/' + categoryId,
    type: 'get',
    data: {protocol:'json', params:selectParams},
    success: function(data) {
      if(data.isSuccess) {
        setResultDatas(categoryId, data.rows, resultBlockId, selectParams);
      }
      else {
        $("#"+resultBlockId).text(data.rtnMsg);
      }
    },
    error: function(e) {
      $("#"+resultBlockId).text('Error : ' + e);
    }
  });
}

function manipulateAjaxById(procType, categoryId, updateParams, callback) {

  $.ajax({
    url:'/salgozi/' + procType,
    type: 'get',
    data: {protocol:'json', categoryId:categoryId, params:updateParams},
    success: function(data) {
      callback(data);
    },
    error: function(e) {
      console.log('Error : ' + e);
    }
  });
}

function getDataBySql(sql, params, callback) {

  $.ajax({
    url:'/salgozi/select_datas',
    type: 'get',
    data: {protocol:'json', sql:sql, params:params},
    success: function(data) {
      if(data.isSuccess) {
        callback(data.rows);
      }
      else {
        alert(data.rtnMsg);
      }
    },
    error: function(e) {
      console.log(e);
    }
  });
}

function setTitle(categoryId, resultBlockId) {

  var list = '<tr bgcolor="#70F08A">';
  list += '<td><b>No</b></td>';

  Object.keys(BlockDefine[categoryId].columns).forEach(function(columnId) {

    if(BlockDefine[categoryId].isSort)
      list += '<td align="center"><b><a onclick="javascript:searchDatas(\''+categoryId+'\' , \''+resultBlockId+'\' , \'{}\', \''+columnId+'\');">'+BlockDefine[categoryId].columns[columnId].name+'</a></b></td>';
    else
      list += '<td align="center"><b>'+BlockDefine[categoryId].columns[columnId].name+'</b></td>';
  });
  
  if(BlockDefine[categoryId].isModify)
    list += '<td align="center">&nbsp;</td>';
  if(BlockDefine[categoryId].isDelete)
    list += '<td align="center">&nbsp;</td>';

  list += '</tr>';

  return list;
}

function setResultDatas(categoryId, dataRows, resultBlockId, selectParams) {

  var list = '<table border=1>';
  list += setTitle(categoryId, resultBlockId);

  let summaryByColumnId = new Object();
  Object.keys(BlockDefine[categoryId].columns).forEach((columnId, i) => {
    summaryByColumnId[columnId] = 0;
  });

  let isDragAndDrop = BlockDefine[categoryId].isDragAndDrop;

  dataRows.forEach((row, i) => {

    let pkValue = getPrimaryKey(row);
    let pkValueWithSeqNum = pkValue + '_' + i;

    if(isDragAndDrop)
      list += '<tr id="'+pkValueWithSeqNum+'" class="'+resultBlockId+'" onclick="changeBgColor(this);" draggable="true" ondragstart="drag(event, \''+categoryId+'\')">';
    else 
      list += '<tr id="'+pkValueWithSeqNum+'" onclick="changeBgColor(this);">';
    
    list += '<td align="right">'+(i+1)+'.';
    if(BlockDefine[categoryId].isSelect) {
      list += '<input type="checkbox" name="item" value="'+ pkValue +'">';
    }
    list += '</td>';

    Object.keys(BlockDefine[categoryId].columns).forEach((columnId, i) => {
      list += '<td align="' + BlockDefine[categoryId].columns[columnId].align + '">';

      let colValue = getCodeValue(categoryId, columnId, row[columnId]);
      if(BlockDefine[categoryId].columns[columnId].isBold)
        colValue = '<b>' + colValue + '</b>';


      if(BlockDefine[categoryId].columns[columnId].isModi) {

        let boxSize = 5;
        if(BlockDefine[categoryId].columns[columnId].isNum)
          boxSize = 1;

        list += '<span class="dataRowView_'+pkValueWithSeqNum+'">' + colValue + '</span>';
        list += '<input type=text name="'+columnId+'" value="'+row[columnId]+'" class="dataRowModify_'+pkValueWithSeqNum+'" size='+boxSize+' maxlength=1 style="text-align:right;background:#ffff99"/>';
      }
      else {
        list += colValue;
      }

      if(BlockDefine[categoryId].columns[columnId].isSum)
        summaryByColumnId[columnId] += row[columnId];

      list += '</td>';
    });

    if(BlockDefine[categoryId].isModify)
      list += '<td><button id="button_modify_'+pkValueWithSeqNum+'" onclick="modifyRowData(\''+categoryId+'\', \''+pkValueWithSeqNum+'\', \''+resultBlockId+'\');">수정</botton></td>';
    
    if(BlockDefine[categoryId].isDelete)
      list += '<td><button id="button_delete_'+pkValueWithSeqNum+'" onclick="deleteRowData(\''+categoryId+'\', \''+pkValueWithSeqNum+'\', \''+resultBlockId+'\');">삭제</botton></td>';

    list += '</tr>';

  });

  if(BlockDefine[categoryId].isSum) {
    list += '<tr bgcolor="#D6D88B">';
    list += '<td><b>계</b></td>';
    Object.keys(BlockDefine[categoryId].columns).forEach((columnId, i) => {

      if(BlockDefine[categoryId].columns[columnId].isSum)
        list += `<td align=right><b>${summaryByColumnId[columnId]}</b></td>`;
      else 
        list += '<td>&nbsp;</td>';
    });
    if(BlockDefine[categoryId].isModify) {
      list += '<td>&nbsp;</td>';
    }
    list += '</tr>';
  }

  list += '</table>';
  $("#"+resultBlockId).html(list);

  $("[class^='dataRowModify']").hide();
}

function modifyRowData(categoryId, rowid, resultBlockId) {

  $(".dataRowModify_"+rowid).show();
  $(".dataRowView_"+rowid).hide();
  $("#button_modify_"+rowid).text("저장");
  $("#button_modify_"+rowid).attr("onclick", "saveRowData('"+categoryId+"', '"+rowid+"', '"+resultBlockId+"');");
}

function saveRowData(categoryId, rowid, resultBlockId) {

  var updateParams = new Object();
  var selectParams = new Object();

  try {

    let arrRowId = rowid.split('_');
    BlockDefine[categoryId].pk.forEach(function(columnId, i){
      updateParams[columnId] = arrRowId[i];
      selectParams[columnId] = arrRowId[i];
    });

    var isValid = false;
    var inputs = $("#"+rowid).find("[class^='dataRowModify']");
    inputs.each(function(){

      isValid = checkValidValue(rowid, this.name, this.value);
      if(!isValid) {
        throw new Error('입력값이 올바르지 않습니다.!!!!');
      }
      updateParams[this.name] = this.value;
    });

    manipulateAjaxById('modify', categoryId, updateParams, function(result) {
      callAjaxProtocol(categoryId, selectParams, resultBlockId);
    });

  } 
  catch(err) {
    console.log(err.message);
  }

}



function deleteRowData(categoryId, rowid, resultBlockId) {

  var updateParams = new Object();

  try {

    let arrRowId = rowid.split('_');
    BlockDefine[categoryId].pk.forEach(function(columnId, i) {
      updateParams[columnId] = arrRowId[i];
    });

    manipulateAjaxById('delete', categoryId, updateParams, function(result) {
      callAjaxProtocol(categoryId, updateParams, resultBlockId);
    });

  } catch(err) {
    console.log(err.message);
  }

}


function checkValidValue(id, name, value) {

    if( name === 'gakgung' 
        && (value < 0 || value > 1)) {
      alert('각궁여부는 0 또는 1만 입력 가능합니다.!!!');
      $("#"+id).find("[name="+name+"]").focus();
      return false;
    }
    else if( name.match(/round[123]_hits/gi) 
            && (value < 0 || value > 5)) {
      alert('시수는 0 ~ 5까지 입력 가능합니다.!!!');
      $("#"+id).find("[name="+name+"]").focus();
      return false;
    }
    else if( name === 'shotting_seq' 
        && (value < 1 || value > 7)) {
      alert('사대순서는 1 ~ 7까지 입력 가능합니다.!!!');
      $("#"+id).find("[name="+name+"]").focus();
      return false;
    }

    return true;
}

function getPrimaryKey(row) {

  if(row.gnum && row.mid)
    return row.gnum +'_'+ row.mid;
  else if(row.gnum)
    return row.gnum;

  return row.mid;
}


function getCodeValue(categoryId, columnId, val) {

  if(BlockDefine[categoryId] && BlockDefine[categoryId].codeDefine[columnId])
    return BlockDefine[categoryId].codeDefine[columnId][val];

  return val;

}


/* 클릭한 행의 바탕색을 변경한다. */
function changeBgColor(obj) {

    var bgColor = $(obj).css('background-color');
    if(bgColor == 'transparent' || bgColor === 'rgba(0, 0, 0, 0)')
        $(obj).css('background-color', 'yellow');
    else 
        $(obj).css('background-color', '');
}
