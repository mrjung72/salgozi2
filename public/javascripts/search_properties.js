
  var SelectConditionParams = new Object();
 
  var BlockDefine = new Object();
  BlockDefine.members = {
    columns:{
      name:               {search_column:"name"              ,isNum:false ,isModi:false,  isBold:true, align:"center" ,orderby:"asc"   ,name:"이름"     }
     ,position_name:      {search_column:"position_name"     ,isNum:false ,isModi:false,  align:"center" ,orderby:"asc"   ,name:"호칭"     }
    //  ,gender:             {search_column:"gender"            ,isNum:false ,isModi:false,  align:"center" ,orderby:"asc"   ,name:"성별"     }
     ,age:                {search_column:"birthday"          ,isNum:true ,isModi:false,  align:"right"  ,orderby:"asc"   ,name:"나이"     }
     ,bonus:              {search_column:"bonus"             ,isNum:true ,isModi:false,  align:"right"  ,orderby:"asc"   ,name:"덤"       }
     // ,join_date:          {search_column:"join_date"         ,isNum:false ,isModi:true,  align:"center" ,orderby:"asc"   ,name:"입정일"   }
     // ,regular_date:       {search_column:"regular_date"      ,isNum:false ,isModi:true,  align:"center" ,orderby:"asc"   ,name:"집궁일"   }
     // ,first_5hits_date:   {search_column:"first_5hits_date"  ,isNum:false ,isModi:true,  align:"center" ,orderby:"asc"   ,name:"초몰기일" }
     ,shooting_priority:  {search_column:"shooting_priority" ,isNum:true ,isModi:false,  align:"right"  ,orderby:"asc"   ,name:"팔"   }
    }
    ,codeDefine:{
      gender:{M:"남", W:"여"}
    }
    ,pk:["mid"]
    ,isSelect:true
    ,isModify:false
    ,isDelete:false
    ,isSum:false
    ,isSort:true
  };

  BlockDefine.monthly_games = {
    columns:{
      gnum:        {search_column:"gnum"        ,isNum:false ,isModi:false ,isBold:true, align:"right"   ,orderby:"asc"   ,name:"회차" }
     ,event_date:  {search_column:"event_date"  ,isNum:false  ,isModi:true  ,align:"center"   ,orderby:"asc"   ,name:"개최일자" }
     ,status:      {search_column:"status"      ,isNum:false  ,isModi:true  ,align:"center"   ,orderby:"asc"   ,name:"상태"     }
    }
    ,codeDefine:{
      status:{P:"진행중", F:"종료"}
    }
    ,pk:["gnum"]
    ,isSelect:false
    ,isModify:true
    ,isDelete:true
    ,isSum:false
    ,isSort:true
  };

  BlockDefine.game_personal_score = {
    columns:{
      //  gnum:               {search_column:"gnum"              ,isNum:true  ,isModi:false ,align:"right"  ,orderby:"asc"  ,name:"회차"}
       name:               {search_column:"name"              ,isNum:false ,isModi:false  ,isBold:true, align:"center" ,orderby:"asc"  ,name:"이름"}
      ,position_name:      {search_column:"position_name"     ,isNum:false ,isModi:false  ,align:"center" ,orderby:"asc"  ,name:"호칭"}
      // ,mid:                {search_column:"mid"               ,isNum:false ,isModi:false  ,align:"center" ,orderby:"asc"  ,name:"mid"     }
      ,age:                {search_column:"age"              ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"나이"     }
      // ,shooting_priority:  {search_column:"shooting_priority" ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"팔찌동"   }
      ,gakgung:            {search_column:"gakgung"           ,isNum:true ,isModi:true  ,align:"right"  ,isSum:true ,orderby:"asc"  ,name:"각죽" }
      ,round1_hits:         {search_column:"round1_hits"      ,isNum:true ,isModi:true  ,isBold:true, align:"right"  ,isSum:true ,orderby:"asc"  ,name:"1순" }
      ,round2_hits:         {search_column:"round2_hits"      ,isNum:true ,isModi:true  ,isBold:true, align:"right"  ,isSum:true ,orderby:"asc"  ,name:"2순" }
      ,round3_hits:         {search_column:"round3_hits"      ,isNum:true ,isModi:true  ,isBold:true, align:"right"  ,isSum:true ,orderby:"asc"  ,name:"3순" }
      ,real_hits:           {search_column:"real_hits"        ,isNum:true ,isModi:false  ,isBold:true, align:"right"  ,isSum:true  ,orderby:"asc"  ,name:"본시수"}
      ,bonus:               {search_column:"bonus"            ,isNum:true ,isModi:false  ,align:"right"  ,isSum:true  ,orderby:"asc"  ,name:"덤"}
      ,total_hits:          {search_column:"total_hits"       ,isNum:true ,isModi:false  ,isBold:true, align:"right"  ,isSum:true  ,orderby:"asc"  ,name:"총시수"}
      ,apply_team_game:     {search_column:"apply_team_game"  ,isNum:true ,isModi:true  ,isBold:false, align:"center"  ,isSum:true  ,orderby:"asc"  ,name:"단체전"}
      // ,ranking:             {search_column:"ranking"          ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"순위"}
      // ,shooting_group:      {search_column:"shooting_group"   ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"작대"}
      // ,shotting_seq:        {search_column:"shotting_seq"     ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"순서"}
    }
    ,codeDefine:{
       ranking:{1:"장원", 2:"차상", 3:"차하", 0:""}
      ,gakgung:{1:"각죽", 0:""}
      ,apply_team_game:{1:"참가", 0:"불참"}
    }
    ,pk:["gnum","mid"]
    ,isSelect:false
    ,isModify:true
    ,isDelete:false
    ,isSum:true
    ,isSort:true
  };

  BlockDefine.game_members = {
    columns:{
       // gnum:               {search_column:"gnum"              ,isNum:true  ,isModi:false ,align:"right"  ,orderby:"asc"  ,name:"회차"}
      // ,rownum:             {search_column:"rownum"            ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"   ,name:"순번"     }
      name:               {search_column:"name"              ,isNum:false ,isModi:false  ,isBold:true, align:"center" ,orderby:"asc"  ,name:"이름"     }
      ,position_name:      {search_column:"position_name"     ,isNum:false ,isModi:false,  align:"center" ,orderby:"asc"   ,name:"호칭"     }
      ,age:                {search_column:"age"               ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"나이"     }
      ,bonus:              {search_column:"bonus"             ,isNum:true ,isModi:true  ,align:"right"  ,orderby:"asc"  ,name:"덤"}
      ,gakgung:            {search_column:"gakgung"           ,isNum:true ,isModi:true  ,align:"right"  ,orderby:"asc"  ,name:"각죽" }
    }
    ,codeDefine:{
    }
    ,pk:["gnum","mid"]
    ,isSelect:false
    ,isModify:true
    ,isDelete:true
    ,isSum:false
    ,isSort:true
  };


  BlockDefine.game_shooting_group = {
    columns:{
       name:            {search_column:"name"            ,isNum:false ,isModi:false  ,isBold:true, align:"center" ,orderby:"asc"  ,name:"이름"}
      ,position_name:   {search_column:"position_name"   ,isNum:false ,isModi:false  ,align:"center" ,orderby:"asc"  ,name:"호칭"}
      ,age:             {search_column:"age"             ,isNum:true  ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"나이" }
      ,gakgung:         {search_column:"gakgung"         ,isNum:true ,isModi:false  ,align:"right"  ,orderby:"asc"  ,name:"각죽" }
      ,shooting_group:  {search_column:"shooting_group"  ,isNum:true  ,isModi:true  ,align:"right"  ,orderby:"asc"  ,name:"작대"}
      ,shooting_seq:  {search_column:"shooting_seq"  ,isNum:true  ,isModi:true  ,align:"right"  ,orderby:"asc"  ,name:"순서"}
    }
    ,codeDefine:{
    }
    ,pk:["gnum", "mid"]
    ,isSelect:false
    ,isModify:true
    ,isDelete:false
    ,isSum:false
    ,isSort:true
  };

  BlockDefine.game_shooting_group_by_team = {
    columns:{
       name:            {search_column:"name"            ,isNum:false ,isModi:false  ,isBold:false, align:"center" ,isSum:false ,orderby:"asc"  ,name:"이름"}
       ,position_name:   {search_column:"position_name"   ,isNum:false ,isModi:false  ,align:"center" ,isSum:false ,orderby:"asc"  ,name:"호칭"}
       ,age:             {search_column:"age"             ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false ,orderby:"asc"  ,name:"나이" }
      ,gakgung:         {search_column:"gakgung"         ,isNum:true  ,isModi:true   ,align:"right"  ,isSum:true ,orderby:"asc"  ,name:"각죽" }
    }
    ,codeDefine:{
    }
    ,pk:[]
    ,isSelect:false
    ,isModify:false
    ,isDelete:false
    ,isSum:true
    ,isSort:false
    ,isDragAndDrop:true
  };

  BlockDefine.select_team_jakdae = {
    columns:{
      //  gnum:      {search_column:"gnum"       ,isNum:true  ,isModi:false ,align:"right"  ,isSum:false ,orderby:"asc"  ,name:"회차"}
       name:      {search_column:"name"       ,isNum:false ,isModi:false  ,isBold:true, align:"center" ,isSum:false ,orderby:"asc"  ,name:"이름"}
       ,position_name:   {search_column:"position_name"   ,isNum:false ,isModi:false  ,align:"center" ,orderby:"asc"  ,name:"호칭"}
       ,age:       {search_column:"age"        ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false  ,orderby:"asc"  ,name:"나이"}
      ,gakgung:   {search_column:"gakgung"    ,isNum:false ,isModi:false  ,align:"right" ,isSum:true  ,orderby:"asc"  ,name:"각죽"}
      ,score:     {search_column:"score"      ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:true  ,orderby:"asc"  ,name:"시수"}
      ,upt_number:{search_column:"upt_number" ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false ,orderby:"asc"  ,name:"순번"}
      ,team_num:  {search_column:"team_num"   ,isNum:false ,isModi:true  ,align:"center" ,isSum:false ,orderby:"asc"  ,name:"작대"}
    }
    ,codeDefine:{
    }
    ,pk:["gnum","mid"]
    ,isSelect:false
    ,isModify:true
    ,isDelete:false
    ,isSum:false
    ,isSort:true
  };


  BlockDefine.select_team_jakdae_by_team = {
    columns:{
       name:     {search_column:"name"       ,isNum:false ,isModi:false  ,isBold:false, align:"center" ,isSum:false ,orderby:"asc"  ,name:"이름"}
      ,position_name: {search_column:"position_name"   ,isNum:false ,isModi:false  ,align:"center" ,isSum:false ,orderby:"asc"  ,name:"호칭"}
      // ,age:      {search_column:"age"        ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false  ,orderby:"asc"  ,name:"나이"}
      ,gakgung:  {search_column:"gakgung"    ,isNum:false ,isModi:false  ,align:"right" ,isSum:true  ,orderby:"asc"  ,name:"각"}
      ,score:    {search_column:"score"      ,isNum:true  ,isModi:false  ,isBold:true ,align:"right"  ,isSum:true  ,orderby:"asc"  ,name:"시수"}
    }
    ,codeDefine:{
   }
   ,pk:[]
    ,isSelect:false
    ,isModify:false
    ,isDelete:false
    ,isSum:true
    ,isSort:false
    ,isDragAndDrop:true
  };

  BlockDefine.select_team_jakdae_summary = {
    columns:{
       team_num:      {search_column:"team_num"       ,isNum:false ,isModi:false  ,align:"center" ,isSum:false ,orderby:"asc"  ,name:"팀번호"}
      ,member_count:  {search_column:"member_count"   ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:true ,orderby:"asc"  ,name:"인원수"}
      ,score_sum:     {search_column:"score_sum"      ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false ,orderby:"asc"  ,name:"점수합계"}
      ,age_sum:       {search_column:"age_sum"        ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:false ,orderby:"asc"  ,name:"나이합계"}
      ,female_count:  {search_column:"female_count"   ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:true ,orderby:"asc"  ,name:"여무사수"}
      ,gakgung_count: {search_column:"gakgung_count"  ,isNum:true  ,isModi:false  ,align:"right"  ,isSum:true ,orderby:"asc"  ,name:"각궁수"}
    }
    ,codeDefine:{
    }
    ,pk:[]
    ,isSelect:false
    ,isModify:false
    ,isDelete:false
    ,isSum:true
    ,isSort:true
  };

