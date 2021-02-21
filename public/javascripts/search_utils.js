/**
 * 팀별 선수를 정의하는 블럭을 생성하고
 * 팀별 선수를 드래그 & 드랍하는 기능을 정의한다.
 */

var pagePath = window.location.pathname;
var pagename = pagePath.substring(pagePath.lastIndexOf('/') + 1);

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, categoryId) {
    ev.dataTransfer.setData("categoryId", categoryId);
    ev.dataTransfer.setData("rowId", ev.target.id);
    ev.dataTransfer.setData("oldBlockId", ev.target.className);
}

function drop(ev) {
    ev.preventDefault();
    let categoryId = ev.dataTransfer.getData("categoryId");
    categoryId = categoryId.replace('_by_team', '');
    let rowId = ev.dataTransfer.getData("rowId");
    let oldBlockId = ev.dataTransfer.getData("oldBlockId");
    let oldTeamNum = oldBlockId.replace('search_result_by_team_', '');
    
    let newBlockId = ev.target.parentElement.className;
    let newTeamNum = newBlockId.replace('search_result_by_team_', '');

    var updateParams = new Object();
    updateParams['shooting_group'] = newTeamNum;
    updateParams['team_num'] = newTeamNum;
    let arrRowId = rowId.split('_');
    BlockDefine[categoryId].pk.forEach(function(columnId, i){
        updateParams[columnId] = arrRowId[i];
    });
  
    manipulateAjaxById('modify', categoryId, updateParams, function(result) {
        callAjaxProtocol(categoryId + '_by_team', {gnum:'293',team_num:oldTeamNum,shooting_group:oldTeamNum}, oldBlockId);
        callAjaxProtocol(categoryId + '_by_team', {gnum:'293',team_num:newTeamNum,shooting_group:newTeamNum}, newBlockId);
    });

    

}


/* 팀별 인원수를 정의하는 블럭생성 html을 반환한다. */
function getHtmlForUnitTeamBlock(cnt, columns_count) {

    let html = '<table><tr>';
    for (let i = 0; i < cnt; i++) {

        if(i%columns_count == 0) {
            html += '</tr>';
            html += '<tr>';
        }
        html += '<td valign="top" align="center">';
        html += '<h2>['+(i+1)+'대]</h2>';
        html += `<div id="search_result_by_team_${(i+1)}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
        html += '</td>';
        html += '<td>&nbsp;</td>';
    }
    html += '</tr>';
    html += '</table>';
    return html;
}
