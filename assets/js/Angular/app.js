var schoex = angular.module('schoex',['ngRoute','ngCookies','ngUpload','ui.autocomplete','angularUtils.directives.dirPagination','timer']).run(function($http,dataFactory,datateachersFactory,$rootScope) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "dashboard", false);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        $rootScope.dashboardData = JSON.parse(xhr.responseText);
        $rootScope.phrase = $rootScope.dashboardData.language;
      }
    }
  };

  $rootScope.defaultAcademicYear = function() {
      angular.forEach($rootScope.dashboardData.academicYear, function (item) {
          if(item.isDefault == "1"){
              return item.id;
          }
        });
  }

  xhr.send(null);
});

var appBaseUrl = $('base').attr('href');

var xhReq = new XMLHttpRequest();
xhReq.open("GET", "api/csrf", false);
xhReq.send(null);

schoex.constant("CSRF_TOKEN", xhReq.responseText);

schoex.run(['$http', 'CSRF_TOKEN' ,'$rootScope', function($http, CSRF_TOKEN,$rootScope) {
    $http.defaults.headers.common['X-Csrf-Token'] = CSRF_TOKEN;
	 $rootScope.go = function(href){
	    var latestOne ;
		if(href != latestOne){
			latestOne = href;
		showHideLoad();
		
		}
   }
}]);

schoex.controller('mainController', function(dataFactory,$rootScope,$route,$scope) {
  var data = $rootScope.dashboardData;
  $scope.phrase = $rootScope.phrase;

  $scope.dashboardData = data;
  $scope.role=data.role;
  $rootScope.phrase = data.language;
  $scope.phrase = data.language;

  $scope.chgAcYearModal = function(){
      $scope.modalTitle = $scope.phrase.chgYear;
      $scope.chgAcYearModalShow = !$scope.chgAcYearModalShow;
  }

  $scope.chgAcYear = function(){
      showHideLoad();
      dataFactory.httpRequest('dashboard/changeAcYear','POST',{},{year:$scope.dashboardData.selectedAcYear}).then(function(data) {
          $scope.chgAcYearModalShow = !$scope.chgAcYearModalShow;
          showHideLoad(true);
          $route.reload();
      });
  }

  $scope.savePollVote = function(){
    showHideLoad();
    if($scope.dashboardData.polls.selected === undefined){
      alert($scope.phrase.voteMustSelect);
      showHideLoad(true);
      return;
    }
    dataFactory.httpRequest('dashboard/polls','POST',{},$scope.dashboardData.polls).then(function(data) {
      data = successOrError(data);
      if(data){
        $scope.dashboardData.polls = data;
      }
      showHideLoad(true);
    });
  }
  showHideLoad(true);
});

schoex.controller('dashboardController', function(dataFactory,$rootScope,$scope) {
  showHideLoad(true);
  $rootScope.defaultAcademicYear();
});

schoex.controller('upgradeController', function(dataFactory,$rootScope,$scope) {
  showHideLoad(true);
});

schoex.controller('calenderController', function(dataFactory,$scope) {
  showHideLoad(true);
});

schoex.controller('registeration', function(dataFactory,$rootScope,$scope) {
  $scope.views = {};
  $scope.classes = {};
  $scope.views.register = true;
  $scope.form = {};
  $scope.form.studentInfo = [];
  $scope.form.role = "teacher" ;

  dataFactory.httpRequest('register/classes').then(function(data) {
    $scope.classes = data;
    showHideLoad(true);
  });

  $scope.tryRegister = function(){
    showHideLoad();
    dataFactory.httpRequest('register','POST',{},$scope.form).then(function(data) {
      data = successOrError(data);
      if(data){
        $scope.regId = data.id;
        $scope.changeView("thanks");
      }
      showHideLoad(true);
    });
  }

  $scope.linkStudent = function(){
    $scope.modalTitle = $rootScope.phrase.linkStudentParent;
    $scope.showModalLink = !$scope.showModalLink;
  }

  $scope.linkStudentButton = function(){
    var searchAbout = $('#searchLink').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.minCharLength3);
      return;
    }
    dataFactory.httpRequest('register/searchStudents/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(student){
    var relationShip = prompt($rootScope.phrase.relationShipEnter, "");
    if (relationShip != null && relationShip != "") {
        $scope.form.studentInfo.push({"student":student.name,"relation":relationShip,"id": "" + student.id + "" });
        $scope.showModalLink = !$scope.showModalLink;
    }
  }

  $scope.changeView = function(view){
    if(view == "register" || view == "thanks" || view == "show"){
      $scope.form = {};
    }
    $scope.views.register = false;
    $scope.views.thanks = false;
    $scope.views[view] = true;
  }
});

schoex.controller('adminsController', function(dataFactory,$rootScope,$scope) {
  $scope.admins = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('admins/listAll').then(function(data) {
	  
    $scope.admins = data;
    showHideLoad(true);
  });

  $scope.saveAdd = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.admins.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('admins/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.admins.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('admins/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

    $scope.saveEdit = function(content){
      response = apiResponse(content,'edit');
      if(content.status == "success"){
        showHideLoad();

        $scope.admins = apiModifyTable($scope.admins,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('classesController', function(dataFactory,$rootScope,$scope) {
  $scope.classes = {};
  $scope.teachers = {};
  $scope.dormitory = {};
  $scope.subject = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('classes/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.teachers = data.teachers;
    $scope.dormitory = data.dormitory;
    $scope.subject = data.subject;
    showHideLoad(true);
  });

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('classes','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.classes.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('classes/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.classes.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('classes/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('classes/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.classes = apiModifyTable($scope.classes,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('subjectsController', function(dataFactory,$rootScope,$scope) {
  $scope.subjects = {};
  $scope.teachers = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('subjects/listAll').then(function(data) {
    $scope.subjects = data.subjects;
    $scope.teachers = data.teachers;
    $scope.classes = data.classes;
    showHideLoad(true);
  });

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('subjects','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.subjects.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('subjects/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.subjects.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('subjects/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('subjects/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.subjects = apiModifyTable($scope.subjects,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('teachersController', function(dataFactory,datateachersFactory,CSRF_TOKEN,$rootScope,$filter,$scope,$sce) {
  var filter = $filter("filter");
  $scope.teachers = {};
  $scope.teachersTemp = {};
  $scope.totalItemsTemp = {};
  $scope.transports = {};
  $scope.teachersApproval = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.form = {};
  $scope.importType ;

  $scope.import = function(impType){
    $scope.importType = impType;
    $scope.changeView('import');
  };

  $scope.saveImported = function(content){
    content = uploadSuccessOrError(content);
    if(content){
      showHideLoad();
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.showModal = false;
  $scope.teacherProfile = function(id){
    dataFactory.httpRequest('teachers/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  getResultsPage(1);
  function getResultsPage(pageNumber) {
	
    if(! $.isEmptyObject($scope.teachersTemp)){
        dataFactory.httpRequest('teachers/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
          $scope.teachers = data.teachers;
          $scope.totalItems = data.totalItems;
		   $scope.newuserRole = data.newuserRole;
		   $scope.userRole = data.userRole;
			$scope.access = data.access;
		  
          showHideLoad(true);
        });
    }else{
        dataFactory.httpRequest('teachers/listAll/'+pageNumber).then(function(data) {
          $scope.teachers = data.teachers;
		  $scope.newuserRole = data.newuserRole
		  $scope.userRole = data.userRole;
			$scope.access = data.access;
          $scope.transports = data.transports;
          $scope.totalItems = data.totalItems;
          showHideLoad(true);
        });
    }
  }

  $scope.searchDB = function(){
      if($scope.searchText.length >= 3){
          if($.isEmptyObject($scope.teachersTemp)){
              $scope.teachersTemp = $scope.teachers ;
              $scope.totalItemsTemp = $scope.totalItems;
              $scope.teachers = {};
          }
          getResultsPage(1);
      }else{
          if(! $.isEmptyObject($scope.teachersTemp)){
              $scope.teachers = $scope.teachersTemp ;
              $scope.totalItems = $scope.totalItemsTemp;
              $scope.teachersTemp = {};
          }
      }
  }

  $scope.saveAdd = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.teachers.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }
$scope.saveAdd1 = function(){
    showHideLoad();
	$scope.selectedrole=[];
		 var filtered = filter($scope.newroles, function (item) {
             return item.IsSelected == true
              })
	var eids = [];
	for (var i in filtered) {
    eids.push(filtered[i].roleId)
	}
		$scope.form['eids']=eids;
	console.log(JSON.stringify($scope.form['eids']));
				var fd = new FormData();
				var file = $scope.photo; 
				fd.append('photo', file);			  
				fd.append('username', $scope.form['username']);
				fd.append('fullName', $scope.form['fullName']);
				fd.append('email', $scope.form['email']);
				fd.append('password', $scope.form['password']);
				if($scope.form['eids']){
				fd.append('eids', JSON.stringify(eids));
				}
				if($scope.form['gender']){
				fd.append('gender', $scope.form['gender']);
				}
				if($scope.form['birthday']) {
				fd.append('birthday', $scope.form['birthday']);
				}
				if($scope.form['address']){
				fd.append('address', $scope.form['address']);
				}
				if($scope.form['phoneNo']){
					fd.append('phoneNo', $scope.form['phoneNo']);
				}
				if($scope.form['mobileNo']){
					fd.append('mobileNo', $scope.form['mobileNo']);
				}
				
				if($scope.form['transport']){
					fd.append('transport', $scope.form['transport']);
				}
				  
	 datateachersFactory.httpRequest('teachers','POST',{},fd).then(function(data) {
    response = apiResponse(data,'add');
	if(data){
      showHideLoad();

      $scope.teachers.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
    /*  if(data){
		  $scope.subjects = data.list.subjects;
        $scope.teachers = data.list.teachers;
        $scope.classes = data.list.classes;
		  
        /*$scope.subjects = data.list.subjects;
        $scope.teachers = data.list.teachers;
        $scope.classes = data.list.classes;data
        $scope.changeView('list');
      }
    showHideLoad(true);*/
    });
}
  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('teachers/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.teachers.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.removeLeaderBoard = function(id,index){
      var confirmRemove = confirm($rootScope.phrase.sureRemove);
      if (confirmRemove == true) {
        showHideLoad();
        dataFactory.httpRequest('teachers/leaderBoard/'+id,'DELETE').then(function(data) {
          response = apiResponse(data,'edit');
          $scope.teachers[index].isLeaderBoard = "";
          showHideLoad(true);
        });
      }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('teachers/'+id).then(function(data) {
      $scope.form = data;
	   var selectedrole=JSON.parse(data.newrole);
	    $scope.selectedrole=selectedrole;    
    });
	 dataFactory.httpRequest('users/getRoles').then(function(data) {
      $scope.newroles = data.userroles;
	
	for(i=0;i<=$scope.newroles.length; i++){
	if($scope.selectedrole.indexOf($scope.newroles[i].roleId) != -1){
	$scope.newroles[i].IsSelected=true;
	}		
	}
	
	  
    });
	$scope.changeView('edit');
      showHideLoad(true);
  }

  $scope.saveEdit = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();

      $scope.teachers = apiModifyTable($scope.teachers,response.id,response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }
$scope.saveEdit1 = function(){
  
	$scope.selectedrole=[];
	
	
	 var filtered = filter($scope.newroles, function (item) {
             return item.IsSelected == true
              })
	var eids = [];
for (var i in filtered) {
    eids.push(filtered[i].roleId)
}
$scope.form['eids']=eids;
$('.overlay, .loading-img').show();
var fd = new FormData();
				var file = $scope.photo; 
				fd.append('photo', file);			  
				fd.append('username', $scope.form['username']);
				fd.append('fullName', $scope.form['fullName']);
				fd.append('email', $scope.form['email']);
				fd.append('password', $scope.form['password']);
				if($scope.form['eids']){
				fd.append('eids', JSON.stringify($scope.form['eids']));
				}
				if($scope.form['gender']){
				fd.append('gender', $scope.form['gender']);
				}
				if($scope.form['birthday']) {
				fd.append('birthday', $scope.form['birthday']);
				}
				if($scope.form['address']){
				fd.append('address', $scope.form['address']);
				}
				if($scope.form['phoneNo']){
					fd.append('phoneNo', $scope.form['phoneNo']);
				}
				if($scope.form['mobileNo']){
					fd.append('mobileNo', $scope.form['mobileNo']);
				}
				
				if($scope.form['transport']){
					fd.append('transport', $scope.form['transport']);
				}
				
			
 datateachersFactory.httpRequest('teachers/'+$scope.form.id,'POST',{},fd).then(function(data) {				
   response = apiResponse(data,'edit');
    if(data){
      showHideLoad();

      $scope.teachers = apiModifyTable($scope.teachers,response.id,response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  });
}
  
  $scope.waitingApproval = function(){
    showHideLoad();
    dataFactory.httpRequest('teachers/waitingApproval').then(function(data) {
      $scope.teachersApproval = data;
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.approve = function(id){
    showHideLoad();
    dataFactory.httpRequest('teachers/approveOne/'+id,'POST').then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
          for (x in $scope.teachersApproval) {
              if($scope.teachersApproval[x].id == id){
                $scope.teachersApproval.splice(x,1);
              }
          }
      }
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.leaderBoard = function(id,index){
    var isLeaderBoard = prompt($rootScope.phrase.leaderBoardMessage);
    showHideLoad();
    dataFactory.httpRequest('teachers/leaderBoard/'+id,'POST',{},{'isLeaderBoard':isLeaderBoard}).then(function(data) {
      response = apiResponse(data,'edit');
      $scope.teachers[index].isLeaderBoard = "x";
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
	  if(view == "add" ){
	   dataFactory.httpRequest('users/getRoles').then(function(data) {
      $scope.newroles = data.userroles;
	
    });
	  }
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.approval = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});
schoex.controller('inventoryController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
  $scope.inventory = {};
   $scope.teachers = {};
   $scope.inventoryTemp = {};
  $scope.totalItemsTemp ={};
  $scope.views = {};
  $scope.views.list = true;
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.userRole ;
  $scope.importType ;
  
 dataFactory.httpRequest('inventory/listTeachersAll').then(function(data) {
    $scope.teachers = data.teachers;
	
    
  });
   $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };
  getResultsPage(1);
  function getResultsPage(pageNumber) {
	  showHideLoad();
	   if(! $.isEmptyObject($scope.inventoryTemp)){
        dataFactory.httpRequest('inventory/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
         $scope.inventory = data.inventory ;
          $scope.totalItems = data.totalItems;
		   
		  
          showHideLoad(true);
        });
    }
	else{
     dataFactory.httpRequest('inventory/listAll/'+pageNumber).then(function(data) {

      $scope.inventory = data.inventory ;
          $scope.totalItems = data.totalItems;
		   $scope.newuserRole = data.newuserRole;
		   $scope.userRole = data.userRole;
			$scope.access = data.access;
       showHideLoad(true);
    });
	}
  }
   
  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
   $scope.saveAdd = function(){
     showHideLoad();
    dataFactory.httpRequest('inventory','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
	if(data){
        $scope.inventory.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
    });
  }
  $scope.searchDB = function(){
      if($scope.searchText.length >= 3){
          if($.isEmptyObject($scope.inventoryTemp)){
              $scope.inventoryTemp = $scope.inventory ;
              $scope.totalItemsTemp = $scope.totalItems;
              $scope.inventory = {};
          }
          getResultsPage(1);
      }else{
          if(! $.isEmptyObject($scope.inventoryTemp)){
              $scope.inventory = $scope.inventoryTemp ;
              $scope.totalItems = $scope.totalItemsTemp;
              $scope.inventoryTemp = {};
          }
      }
  }
  
  
  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('inventory/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }
  


  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('inventory/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
	if(data){
       $scope.teachers.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
    });
  }
$scope.remove = function(item,index){
   var confirmRemove = confirm("Sure remove this inventory?");
    if (confirmRemove == true) {
      showHideLoad();
       dataFactory.httpRequest('inventory/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.teachers.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }
  

});

schoex.controller('studentsController', function(dataFactory,CSRF_TOKEN,$rootScope,$scope,$sce) {
  $scope.students = {};
  $scope.studentsTemp = {};
  $scope.totalItemsTemp = {};
  $scope.classes = {};
  $scope.transports = {};
  $scope.studentsApproval = {};
  $scope.studentMarksheet = {};
  $scope.studentAttendance = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.userRole ;
  $scope.importType ;

  $scope.import = function(impType){
    $scope.importType = impType;
    $scope.changeView('import');
  };

  $scope.saveImported = function(content){
    content = uploadSuccessOrError(content);
    if(content){
      getResultsPage('1');
      showHideLoad();
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.showModal = false;
  $scope.studentProfile = function(id){
    dataFactory.httpRequest('students/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  getResultsPage(1);
  function getResultsPage(pageNumber) {
      if(! $.isEmptyObject($scope.studentsTemp)){
         dataFactory.httpRequest('students/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
           $scope.students = data.students;
           $scope.totalItems = data.totalItems;
           showHideLoad(true);
         });
     }else{
         dataFactory.httpRequest('students/listAll/'+pageNumber).then(function(data) {
          $scope.students = data.students ;
          $scope.classes = data.classes ;
          $scope.transports = data.transports ;
          $scope.totalItems = data.totalItems
          $scope.userRole = data.userRole;
          showHideLoad(true);
        });
    }
  }

  $scope.searchDB = function(){
    if($scope.searchText.length >= 3){
        if($.isEmptyObject($scope.studentsTemp)){
            $scope.studentsTemp = $scope.students ;
            $scope.totalItemsTemp = $scope.totalItems;
            $scope.students = {};
        }
        getResultsPage(1);
    }else{
        if(! $.isEmptyObject($scope.studentsTemp)){
            $scope.students = $scope.studentsTemp ;
            $scope.totalItems = $scope.totalItemsTemp;
            $scope.studentsTemp = {};
        }
    }
  }

  $scope.saveAdd = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();
      $scope.students.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('students/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.students.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.removeStAcYear = function(student,acYear,index){
    var confirmRemoveAcYear = confirm($rootScope.phrase.sureRemove);
    if (confirmRemoveAcYear == true) {
      showHideLoad();
      dataFactory.httpRequest('students/acYear/'+student+'/'+acYear,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.form.studentAcademicYears.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('students/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();
      $scope.students = apiModifyTable($scope.students,response.id,response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.waitingApproval = function(){
    showHideLoad();
    dataFactory.httpRequest('students/waitingApproval').then(function(data) {
      $scope.studentsApproval = data;
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.approve = function(id){
    showHideLoad();
    dataFactory.httpRequest('students/approveOne/'+id,'POST').then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
          for (x in $scope.studentsApproval) {
              if($scope.studentsApproval[x].id == id){
                $scope.studentsApproval.splice(x,1);
              }
          }
      }
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.marksheet = function(id){
    showHideLoad();
    dataFactory.httpRequest('students/marksheet/'+id).then(function(data) {
      data = successOrError(data);
      if(data){
        $scope.studentMarksheet = data;
        $scope.changeView('marksheet');
      }
      showHideLoad(true);
    });
  }

  $scope.leaderBoard = function(id,index){
    var isLeaderBoard = prompt($rootScope.phrase.leaderBoardMessage);
    showHideLoad();
    dataFactory.httpRequest('students/leaderBoard/'+id,'POST',{},{'isLeaderBoard':isLeaderBoard}).then(function(data) {
      apiResponse(data,'edit');
      $scope.students[index].isLeaderBoard = "x";
      showHideLoad(true);
    });
  }

  $scope.removeLeaderBoard = function(id,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('students/leaderBoard/'+id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.students[index].isLeaderBoard = "";
        }
        showHideLoad(true);
      });
    }
  }

  $scope.attendance = function(id){
    showHideLoad();
    dataFactory.httpRequest('students/attendance/'+id).then(function(data) {
      $scope.studentAttendance = data;
      $scope.changeView('attendance');
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.approval = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.attendance = false;
    $scope.views.marksheet = false;
    $scope.views.import = false;
    $scope.views[view] = true;
  }
});

schoex.controller('parentsController', function(dataFactory,CSRF_TOKEN,$scope,$sce,$rootScope) {
  $scope.stparents = {};
  $scope.stparentsTemp = {};
  $scope.totalItemsTemp = {};
  $scope.stparentsApproval = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.form = {};
  $scope.form.studentInfo = {};
  $scope.importType ;
  $scope.searchResults = {};
  $scope.userRole = $rootScope.dashboardData.role;

  $scope.import = function(impType){
    $scope.importType = impType;
    $scope.changeView('import');
  };

  $scope.saveImported = function(content){
    content = uploadSuccessOrError(content);
    if(content){
      showHideLoad();
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.showModal = false;
  $scope.parentProfile = function(id){
    dataFactory.httpRequest('parents/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  getResultsPage(1);
  function getResultsPage(pageNumber) {
      if(! $.isEmptyObject($scope.stparentsTemp)){
          dataFactory.httpRequest('parents/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
            $scope.stparents = data.parents;
            $scope.totalItems = data.totalItems;
          });
      }else{
          dataFactory.httpRequest('parents/listAll/'+pageNumber).then(function(data) {
              $scope.stparents = data.parents ;
              $scope.totalItems = data.totalItems;
              showHideLoad(true);
            });
      }
  }

  $scope.searchDB = function(){
      if($scope.searchText.length >= 3){
          if($.isEmptyObject($scope.stparentsTemp)){
              $scope.stparentsTemp = $scope.stparents ;
              $scope.totalItemsTemp = $scope.totalItems;
              $scope.stparents = {};
          }
          getResultsPage(1);
      }else{
          if(! $.isEmptyObject($scope.stparentsTemp)){
              $scope.stparents = $scope.stparentsTemp ;
              $scope.totalItems = $scope.totalItemsTemp;
              $scope.stparentsTemp = {};
          }
      }
  }

  $scope.saveAdd = function(data){
    showHideLoad();
    response = apiResponse(data,'add');
    if(data.status == "success"){
      $scope.stparents.push(response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('parents/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.stparents.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.removeStudent = function(index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      for (x in $scope.form.studentInfo) {
        if($scope.form.studentInfo[x].id == index){
          $scope.form.studentInfo.splice(x,1);
          $scope.form.studentInfoSer = JSON.stringify($scope.form.studentInfo);
          break;
        }
      }
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('parents/'+id).then(function(data) {
      $scope.form = data;
      if(data.parentOf == null || data.parentOf == ''){
        $scope.form.studentInfo = [];
      }else{
        $scope.form.studentInfo = data.parentOf;
      }
      $scope.form.studentInfoSer = JSON.stringify($scope.form.studentInfo);
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.monitorParentChange = function(){
      $scope.form.studentInfoSer = JSON.stringify($scope.form.studentInfo);
  }

  $scope.saveEdit = function(data){
      showHideLoad();
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.stparents = apiModifyTable($scope.stparents,response.id,response);
        $scope.changeView('list');
        showHideLoad(true);
      }
  }

  $scope.waitingApproval = function(){
    showHideLoad();
    dataFactory.httpRequest('parents/waitingApproval').then(function(data) {
      $scope.stparentsApproval = data;
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.approve = function(id){
    showHideLoad();
    dataFactory.httpRequest('parents/approveOne/'+id,'POST').then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
          for (x in $scope.stparentsApproval) {
              if($scope.stparentsApproval[x].id == id){
                $scope.stparentsApproval.splice(x,1);
              }
          }
      }
      $scope.changeView('approval');
      showHideLoad(true);
    });
  }

  $scope.linkStudent = function(){
    $scope.modalTitle = $rootScope.phrase.linkStudentParent;
    $scope.showModalLink = !$scope.showModalLink;
  }

  $scope.linkStudentButton = function(){
    var searchAbout = $('#searchLink').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.minCharLength3);
      return;
    }
    dataFactory.httpRequest('parents/search/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(student){
    var relationShip = prompt($rootScope.phrase.relationShipEnter, "");
    if (relationShip != null && relationShip != "") {
        $scope.form.studentInfo.push({"student":student.name,"relation":relationShip,"id": "" + student.id + "" });
        $scope.form.studentInfoSer = JSON.stringify($scope.form.studentInfo);
        $scope.showModalLink = !$scope.showModalLink;
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
      $scope.form.studentInfo = [];
    }
    $scope.views.list = false;
    $scope.views.approval = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('newsboardController', function(dataFactory,$routeParams,$sce,$rootScope,$scope) {
  $scope.newsboard = {};
  $scope.newsboardTemp = {};
  $scope.totalItemsTemp = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole ;

  if($routeParams.newsId){
    showHideLoad();
    dataFactory.httpRequest('newsboard/'+$routeParams.newsId).then(function(data) {
      $scope.form = data;
      $scope.form.newsText = $sce.trustAsHtml(data.newsText);
      $scope.changeView('read');
      showHideLoad(true);
    });
  }else{
    $scope.totalItems = 0;
    $scope.pageChanged = function(newPage) {
      getResultsPage(newPage);
    };

    getResultsPage(1);
  }

  function getResultsPage(pageNumber) {
      if(! $.isEmptyObject($scope.newsboardTemp)){
          dataFactory.httpRequest('newsboard/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
            $scope.newsboard = data.newsboard;
            $scope.totalItems = data.totalItems;
          });
      }else{
        dataFactory.httpRequest('newsboard/listAll/'+pageNumber).then(function(data) {
          $scope.newsboard = data.newsboard;
          $scope.userRole = data.userRole;
          $scope.totalItems = data.totalItems;
          showHideLoad(true);
        });
    }
  }

  $scope.searchDB = function(){
    if($scope.searchText.length >= 3){
        if($.isEmptyObject($scope.newsboardTemp)){
            $scope.newsboardTemp = $scope.newsboard ;
            $scope.totalItemsTemp = $scope.totalItems;
            $scope.newsboard = {};
        }
        getResultsPage(1);
    }else{
        if(! $.isEmptyObject($scope.newsboardTemp)){
            $scope.newsboard = $scope.newsboardTemp ;
            $scope.totalItems = $scope.totalItemsTemp;
            $scope.newsboardTemp = {};
        }
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('newsboard','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.newsboard.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('newsboard/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.newsboard.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('newsboard/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('newsboard/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.newsboard = apiModifyTable($scope.newsboard,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('libraryController', function(dataFactory,CSRF_TOKEN,$rootScope,$scope) {
  $scope.library = {};
  $scope.libraryTemp = {};
  $scope.totalItemsTemp = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.userRole ;

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  getResultsPage(1);
  function getResultsPage(pageNumber) {
      if(! $.isEmptyObject($scope.libraryTemp)){
          dataFactory.httpRequest('library/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
            $scope.library = data.bookLibrary;
            $scope.totalItems = data.totalItems;
          });
      }else{
        dataFactory.httpRequest('library/listAll/'+pageNumber).then(function(data) {
          $scope.library = data.bookLibrary;
          $scope.totalItems = data.totalItems;
          $scope.userRole = data.userRole;
          showHideLoad(true);
        });
      }
  }

  $scope.searchDB = function(){
      if($scope.searchText.length >= 3){
          if($.isEmptyObject($scope.libraryTemp)){
              $scope.libraryTemp = $scope.library ;
              $scope.totalItemsTemp = $scope.totalItems;
              $scope.library = {};
          }
          getResultsPage(1);
      }else{
          if(! $.isEmptyObject($scope.libraryTemp)){
              $scope.library = $scope.libraryTemp ;
              $scope.totalItems = $scope.totalItemsTemp;
              $scope.libraryTemp = {};
          }
      }
  }

  $scope.saveAdd = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.library.push(response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('library/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.library.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('library/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();

      $scope.library = apiModifyTable($scope.library,response.id,response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});


schoex.controller('accountSettingsController', function(dataFactory,CSRF_TOKEN,$rootScope,$scope,$route) {
  $scope.account = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.languages = {};
  $scope.languageAllow ;
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  var methodName = $route.current.methodName;

  $scope.changeView = function(view){
    if(view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.profile = false;
    $scope.views.email = false;
    $scope.views.password = false;
    $scope.views[view] = true;
  }

  if(methodName == "profile"){
    dataFactory.httpRequest('accountSettings/langs').then(function(data) {
      $scope.languages = data.languages;
      $scope.languageAllow = data.languageAllow;
      $scope.layoutColorUserChange = data.layoutColorUserChange;
      showHideLoad(true);
    });
    dataFactory.httpRequest('accountSettings/data').then(function(data) {
      $scope.form = data;
      $scope.oldThemeVal = data.defTheme;
      $scope.changeView('profile');
      showHideLoad(true);
    });
  }else if(methodName == "email"){
    $scope.form = {};
    $scope.changeView('email');
    showHideLoad(true);
  }else if(methodName == "password"){
    $scope.form = {};
    $scope.changeView('password');
    showHideLoad(true);
  }

  $scope.saveEmail = function(){
    if($scope.form.email != $scope.form.reemail){
      alert($rootScope.phrase.mailReMailDontMatch);
    }else{
      showHideLoad();
      dataFactory.httpRequest('accountSettings/email','POST',{},$scope.form).then(function(data) {
        response = apiResponse(data,'edit');
        showHideLoad(true);
      });
    }
  }

  $scope.savePassword = function(){
    if($scope.form.newPassword != $scope.form.repassword){
      alert($rootScope.phrase.passRepassDontMatch);
    }else{
      showHideLoad();
      dataFactory.httpRequest('accountSettings/password','POST',{},$scope.form).then(function(data) {
        response = apiResponse(data,'edit');
        showHideLoad(true);
      });
    }
  }

  $scope.saveProfile = function(){
    showHideLoad();
    dataFactory.httpRequest('accountSettings/profile','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(response){
          if($scope.form.defTheme != $scope.oldThemeVal){
              location.reload();
          }
          $scope.form = response;
      }
      showHideLoad(true);
    });
  }
});

schoex.controller('classScheduleController', function(dataFactory,$rootScope,$scope,$sce) {
  $scope.classes = {};
  $scope.subject = {};
  $scope.days = {};
  $scope.classSchedule = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole ;

  dataFactory.httpRequest('classschedule/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.subject = data.subject;
    $scope.userRole = data.userRole;
    $scope.days = data.days;
    showHideLoad(true);
  });

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('classschedule/'+id).then(function(data) {
      $scope.classSchedule = data;
      $scope.classId = id;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.removeSub = function(id,day){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('classschedule/'+$scope.classId+'/'+id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
            for (x in $scope.classSchedule[day].sub) {
                if($scope.classSchedule[day].sub[x].id == id){
                  $scope.classSchedule[day].sub.splice(x,1);
                }
            }
        }
        showHideLoad(true);
      });
    }
  }

  $scope.addSubOne = function(day){
    $scope.form = {};
    $scope.form.dayOfWeek = day;

    $scope.modalTitle = $rootScope.phrase.addSch;
    $scope.scheduleModal = !$scope.scheduleModal;
  }

  $scope.saveAddSub = function(){
    showHideLoad();
    dataFactory.httpRequest('classschedule/'+$scope.classId,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
          if(! $scope.classSchedule[response.dayOfWeek].sub){
              $scope.classSchedule[response.dayOfWeek].sub = [];
          }
          $scope.classSchedule[response.dayOfWeek].sub.push({"id":response.id,"classId":response.classId,"subjectId":response.subjectId,"start":response.startTime,"end":response.endTime});
      }
      $scope.scheduleModal = !$scope.scheduleModal;
      showHideLoad(true);
    });
  }

  $scope.editSubOne = function(id,day){
    showHideLoad();
    $scope.form = {};
    dataFactory.httpRequest('classschedule/sub/'+id).then(function(data) {
      $scope.form = data;
      $scope.oldDay = day;

      $scope.modalTitle = $rootScope.phrase.editSch;
      $scope.scheduleModalEdit = !$scope.scheduleModalEdit;
      showHideLoad(true);
    });
  }

  $scope.saveEditSub = function(id){
    showHideLoad();
    dataFactory.httpRequest('classschedule/sub/'+id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
          for (x in $scope.classSchedule[$scope.oldDay].sub) {
              if($scope.classSchedule[$scope.oldDay].sub[x].id == id){
                $scope.classSchedule[$scope.oldDay].sub.splice(x,1);
              }
          }
          if(! $scope.classSchedule[response.dayOfWeek].sub){
              $scope.classSchedule[response.dayOfWeek].sub = [];
          }
          $scope.classSchedule[response.dayOfWeek].sub.push({"id":response.id,"classId":response.classId,"subjectId":response.subjectId,"start":response.startTime,"end":response.endTime});
      }
      $scope.scheduleModalEdit = !$scope.scheduleModalEdit;
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.editSub = false;
    $scope.views.addSub = false;
    $scope.views[view] = true;
  }
});


schoex.controller('settingsController', function(dataFactory,$rootScope,$scope,$route) {
  $scope.views = {};
  $scope.form = {};
  $scope.languages = {};
  $scope.newDayOff ;
  var methodName = $route.current.methodName;
  $scope.oldThemeVal;

  $scope.changeView = function(view){
    $scope.views.settings = false;
    $scope.views.terms = false;
    $scope.views[view] = true;
  }

  if(methodName == "settings"){
    dataFactory.httpRequest('siteSettings/langs').then(function(data) {
      $scope.languages = data.languages;
      showHideLoad(true);
    });
    dataFactory.httpRequest('siteSettings/siteSettings').then(function(data) {
      $scope.form = data.settings;
      $scope.formS = data.smsProvider;
      $scope.formM = data.mailProvider;
      $scope.oldThemeVal = $scope.form.layoutColor;
      showHideLoad(true);
    });
    $scope.changeView('settings');
  }else if(methodName == "terms"){
    dataFactory.httpRequest('siteSettings/terms').then(function(data) {
      $scope.form = data;
      showHideLoad(true);
    });
    $scope.changeView('terms');
  }

  $scope.officialVacationDayAdd = function(){
      if($scope.newDayOff == '' || typeof $scope.newDayOff === "undefined"){ return; }
      $scope.form.officialVacationDay.push($scope.newDayOff);
  }

  $scope.removeVacationDay = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
        $scope.form.officialVacationDay.splice(index,1);
    }
  }

  $scope.saveEdit = function(){
    showHideLoad();
    showHideLoad();
    $scope.form.smsProvider = $scope.formS;
    $scope.form.mailProvider = $scope.formM;
    dataFactory.httpRequest('siteSettings/siteSettings','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if($scope.form.layoutColor != $scope.oldThemeVal){
          location.reload();
      }
      showHideLoad(true);
    });
  }

  $scope.saveTerms = function(){
    showHideLoad();
    dataFactory.httpRequest('siteSettings/terms','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      showHideLoad(true);
    });
  }

});

schoex.controller('attendanceController', function(dataFactory,$scope) {
  $scope.classes = {};
  $scope.attendanceModel;
  $scope.subjects = {};
  $scope.views = {};
  $scope.form = {};
  $scope.userRole ;
  $scope.class = {};
  $scope.subject = {};
  $scope.students = {};

  dataFactory.httpRequest('attendance').then(function(data) {
    $scope.classes = data.classes;
    $scope.subjects = data.subject;
    $scope.attendanceModel = data.attendanceModel;
    $scope.userRole = data.userRole;
    $scope.changeView('list');
    showHideLoad(true);
  });

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.classId}).then(function(data) {
          $scope.subjects = data;
      });
  }

  $scope.startAttendance = function(){
    showHideLoad();
    dataFactory.httpRequest('attendance/list','POST',{},$scope.form).then(function(data) {
      $scope.class = data.class;
      if(data.subject){
        $scope.subject = data.subject;
      }
      $scope.students = data.students;
      $scope.changeView('lists');
      showHideLoad(true);
    });
  }

  $scope.saveAttendance = function(){
    showHideLoad();
    $scope.form.classId = $scope.class.id;
    $scope.form.attendanceDay = $scope.form.attendanceDay;
    $scope.form.stAttendance = $scope.students;
    if($scope.subject.id){
      $scope.form.subject = $scope.subject.id;
    }
    dataFactory.httpRequest('attendance','POST',{},$scope.form).then(function(data) {
      apiResponse(data,'add');
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    $scope.views.list = false;
    $scope.views.lists = false;
    $scope.views.edit = false;
    $scope.views.editSub = false;
    $scope.views.addSub = false;
    $scope.views[view] = true;
  }
});

schoex.controller('staffAttendanceController', function(dataFactory,$scope) {
  $scope.views = {};
  $scope.form = {};
  $scope.views.list = true;
  $scope.teachers = {};

  showHideLoad(true);
  $scope.startAttendance = function(){
    showHideLoad();
    dataFactory.httpRequest('sattendance/list','POST',{},$scope.form).then(function(data) {
      $scope.teachers = data.teachers;
      $scope.changeView('lists');
      showHideLoad(true);
    });
  }

  $scope.saveAttendance = function(){
    showHideLoad();
    $scope.form.attendanceDay = $scope.form.attendanceDay;
    $scope.form.stAttendance = $scope.teachers;
    dataFactory.httpRequest('sattendance','POST',{},$scope.form).then(function(data) {
      apiResponse(data,'add');
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    $scope.views.list = false;
    $scope.views.lists = false;
    $scope.views.edit = false;
    $scope.views.editSub = false;
    $scope.views.addSub = false;
    $scope.views[view] = true;
  }
});

schoex.controller('reportsController', function(dataFactory,$rootScope,$scope) {
  $scope.views = {};
  $scope.form = {};
  $scope.views.list = true;
  $scope.stats = {};

  showHideLoad(true);
  $scope.usersStats = function(){
    showHideLoad();
    dataFactory.httpRequest('reports','POST',{},{'stats':'usersStats'}).then(function(data) {
      $scope.stats = data;
      $scope.changeView('usersStats');
      showHideLoad(true);
    });
  }

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.classId}).then(function(data) {
          $scope.subjects = data;
      });
  }

  $scope.stdAttendance = function(){
      dataFactory.httpRequest('attendance/stats').then(function(data) {
        $scope.attendanceStats = data;
        $scope.changeView('stdAttendance');
        showHideLoad(true);
      });
  }

  $scope.statsAttendance = function(){
      showHideLoad();
      dataFactory.httpRequest('reports','POST',{},{'stats':'stdAttendance','data':$scope.form}).then(function(data) {
        if(data){
          $scope.attendanceData = data;
          $scope.changeView('stdAttendanceReport');
        }
        showHideLoad(true);
      });
  }

  $scope.staffAttendance = function(){
      showHideLoad();
      dataFactory.httpRequest('reports','POST',{},{'stats':'stfAttendance','data':$scope.form}).then(function(data) {
        if(data){
          $scope.attendanceData = data;
          $scope.changeView('stfAttendanceReport');
        }
        showHideLoad(true);
      });
  }

  $scope.getVacation = function(){
      showHideLoad();
      dataFactory.httpRequest('reports','POST',{},{'stats':'stdVacation','data':$scope.form}).then(function(data) {
        if(data){
          $scope.vacationData = data;
          $scope.changeView('vacationList');
        }
        showHideLoad(true);
      });
  }

  $scope.removeVacation = function(id,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('vacation/'+id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
            $scope.vacationData.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.gettVacation = function(){
      showHideLoad();
      dataFactory.httpRequest('reports','POST',{},{'stats':'stfVacation','data':$scope.form}).then(function(data) {
        if(data){
          $scope.vacationData = data;
          $scope.changeView('vacationList');
        }
        showHideLoad(true);
      });
  }

  $scope.getPayments = function(){
      showHideLoad();
      dataFactory.httpRequest('reports','POST',{},{'stats':'payments','data':$scope.form}).then(function(data) {
        if(data){
          $scope.payments = data;
          $scope.changeView('paymentsResult');
        }
        showHideLoad(true);
      });
  }

  $scope.changeView = function(view){
    $scope.views.list = false;
    $scope.views.lists = false;
    $scope.views.usersStats = false;
    $scope.views.stdAttendance = false;
    $scope.views.stdAttendanceReport = false;
    $scope.views.stfAttendance = false;
    $scope.views.stfAttendanceReport = false;
    $scope.views.stVacation = false;
    $scope.views.teacherVacation = false;
    $scope.views.vacationList = false;
    $scope.views.paymentsReports = false;
    $scope.views.paymentsResult = false;
    $scope.views[view] = true;
  }
});

schoex.controller('gradeLevelsController', function(dataFactory,$rootScope,$scope) {
  $scope.gradeLevels = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('gradeLevels/listAll').then(function(data) {
    $scope.gradeLevels = data;
	 $scope.newuserRole = data.newuserRole;
	  $scope.access = data.access;
    showHideLoad(true);
  });

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('gradeLevels','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.gradeLevels.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('gradeLevels/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('gradeLevels/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.gradeLevels = apiModifyTable($scope.gradeLevels,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('gradeLevels/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.gradeLevels.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('examsListController', function(dataFactory,$rootScope,$scope,$sce) {
  $scope.examsList = {};
  $scope.classes = {};
  $scope.subjects = {};
  $scope.userRole ;
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  $scope.showModal = false;
  $scope.studentProfile = function(id){
    dataFactory.httpRequest('students/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  dataFactory.httpRequest('examsList/listAll').then(function(data) {
    $scope.examsList = data.exams;
    $scope.classes = data.classes;
    $scope.subjects = data.subjects;
    $scope.userRole = data.userRole;
	$scope.newuserRole = data.newuserRole;
	$scope.access = data.access;
    showHideLoad(true);
  });

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.classId}).then(function(data) {
          $scope.subjects = data;
      });
  }

  $scope.notify = function(id){
    var confirmNotify = confirm($rootScope.phrase.sureMarks);
    if (confirmNotify == true) {
      showHideLoad();
      dataFactory.httpRequest('examsList/notify/'+id,'POST',{},$scope.form).then(function(data) {
        apiResponse(data,'add');
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('examsList','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.examsList.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('examsList/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('examsList/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.examsList = apiModifyTable($scope.examsList,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('examsList/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.examsList.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.marks = function(exam){
    $scope.form.exam = exam;
    $scope.changeView('premarks');
  }

  $scope.startAddMarks = function(){
    showHideLoad();
    dataFactory.httpRequest('examsList/getMarks/'+$scope.form.exam+"/"+$scope.form.classId+"/"+$scope.form.subjectId).then(function(data) {
      $scope.form.respExam = data.exam;
      $scope.form.respClass = data.class;
      $scope.form.respSubject = data.subject;
      $scope.form.respStudents = data.students;

      $scope.changeView('marks');
      showHideLoad(true);
    });
  }

  $scope.saveNewMarks = function(){
    showHideLoad();
    dataFactory.httpRequest('examsList/saveMarks/'+$scope.form.exam+"/"+$scope.form.classId+"/"+$scope.form.subjectId,'POST',{},$scope.form).then(function(data) {
      apiResponse(data,'add');
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.premarks = false;
    $scope.views.marks = false;
    $scope.views[view] = true;
  }
});

schoex.controller('eventsController', function(dataFactory,$routeParams,$rootScope,$sce,$scope) {
  $scope.events = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole ;

  if($routeParams.eventId){
    showHideLoad();
    dataFactory.httpRequest('events/'+$routeParams.eventId).then(function(data) {
      $scope.form = data;
      $scope.form.eventDescription = $sce.trustAsHtml(data.eventDescription);
      $scope.changeView('read');
      showHideLoad(true);
    });
  }else{
    dataFactory.httpRequest('events/listAll').then(function(data) {
      $scope.events = data.events;
      $scope.userRole = data.userRole;
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('events/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('events/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.events = apiModifyTable($scope.events,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('events/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.events.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('events','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.events.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('materialsController', function(dataFactory,$rootScope,CSRF_TOKEN,$scope) {
  $scope.classes = {};
  $scope.subject = {};
  $scope.materials = {};
  $scope.views = {};
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole ;

  dataFactory.httpRequest('materials/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.subject = data.subject;
    $scope.materials = data.materials;
    $scope.userRole = data.userRole
    showHideLoad(true);
  });

  $scope.numberSelected = function(item){
    var count = $(item + " :selected").length;
    if(count == 0){
      return true;
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('materials/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(data){
    response = apiResponse(data,'edit');
    if(data.status == "success"){
      showHideLoad();
      $scope.materials = apiModifyTable($scope.materials,response.id,response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('materials/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.materials.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(data){
    response = apiResponse(data,'add');
    if(data.status == "success"){
      showHideLoad();
      $scope.materials.push(response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('assignmentsController', function(dataFactory,$rootScope,CSRF_TOKEN,$scope) {
  $scope.classes = {};
  $scope.subject = {};
  $scope.assignments = {};
  $scope.views = {};
  $scope.CSRF_TOKEN = CSRF_TOKEN;
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole ;

  dataFactory.httpRequest('assignments/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.subject = data.subject;
    $scope.assignments = data.assignments;
    $scope.userRole = data.userRole
	 $scope.access = data.access;
	 $scope.newuserRole = data.newuserRole;
    showHideLoad(true);
  });

  $scope.listAnswers = function(id){
      showHideLoad();
      dataFactory.httpRequest('assignments/listAnswers/'+id).then(function(data) {
          $scope.answers = data;
          $scope.changeView('answers');
          showHideLoad(true);
      });
  }

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.classId}).then(function(data) {
          $scope.subject = data;
          $scope.form.subject = data;
      });
  }

  $scope.upload = function(id){
      showHideLoad();
      dataFactory.httpRequest('assignments/checkUpload','POST',{},{'assignmentId':id}).then(function(data) {
        response = apiResponse(data,'add');
        if(data.canApply && data.canApply == "true"){
            $scope.form.assignmentId = id;
            $scope.changeView('upload');
        }
      });
      showHideLoad(true);
  }

  $scope.saveAnswer = function(content){
      response = apiResponse(content,'edit');
      if(content.status == "success"){
        $scope.changeView('list');
        showHideLoad(true);
      }
  }

  $scope.numberSelected = function(item){
    var count = $(item + " :selected").length;
    if(count == 0){
      return true;
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('assignments/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();

      $scope.assignments = apiModifyTable($scope.assignments,response.id,response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('assignments/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.assignments.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.assignments.push(response);
      $scope.changeView('list');
      showHideLoad(true);
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.upload = false;
    $scope.views.answers = false;
    $scope.views[view] = true;
  }
});

schoex.controller('mailsmsController', function(dataFactory,$rootScope,$scope) {
  $scope.classes = {};
  $scope.views = {};
  $scope.messages = {};
  $scope.views.send = true;
  $scope.form = {};
  $scope.form.selectedUsers = [];
  $scope.formS = {};

  dataFactory.httpRequest('classes/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.form.userType = 'teachers';
    $scope.form.sendForm = 'email';
    showHideLoad(true);
  });

  $scope.getSents = function(){
    showHideLoad();
    dataFactory.httpRequest('mailsms/listAll').then(function(data) {
      $scope.messages = data;
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.settings = function(){
    showHideLoad();
    dataFactory.httpRequest('mailsms/settings').then(function(data) {
      $scope.formS = data.sms;
      $scope.formM = data.mail;
      $scope.changeView('settings');
      showHideLoad(true);
    });
  }

  $scope.saveSettings = function(){
    showHideLoad();
    dataFactory.httpRequest('mailsms/settings','POST',{},$scope.formS).then(function(data) {
      response = apiResponse(data,'edit');
      showHideLoad(true);
    });
  }

  $scope.saveMailSettings = function(){
    showHideLoad();
    dataFactory.httpRequest('mailsms/settings','POST',{},$scope.formM).then(function(data) {
      response = apiResponse(data,'edit');
      showHideLoad(true);
    });
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('mailsms','POST',{},$scope.form).then(function(data) {
      $.gritter.add({
        title: $rootScope.phrase.mailsms,
        text: $rootScope.phrase.mailSentSuccessfully
      });
      $scope.messages = data;
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.linkUsers = function(usersType){
    $scope.modalTitle = $rootScope.phrase.specificUsers;
    $scope.showModalLink = !$scope.showModalLink;
    $scope.usersType = usersType;
  }

  $scope.linkStudentButton = function(){
    var searchAbout = $('#searchLink').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.sureRemove);
      return;
    }
    dataFactory.httpRequest('register/searchUsers/'+$scope.usersType+'/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(userS){
    $scope.form.selectedUsers.push({"student":userS.name,"role":userS.role,"id": "" + userS.id + "" });
  }

  $scope.removeUser = function(index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      for (x in $scope.form.selectedUsers) {
        if($scope.form.selectedUsers[x].id == index){
          $scope.form.selectedUsers.splice(x,1);
          break;
        }
      }
    }
  }

  $scope.changeView = function(view){
    if(view == "send"){
      $scope.form = {};
      $scope.form.userType = 'teachers';
      $scope.form.sendForm = 'email';
    }
    $scope.views.send = false;
    $scope.views.list = false;
    $scope.views.settings = false;
    $scope.views[view] = true;
  }

});

schoex.controller('messagesController', function(dataFactory,$rootScope,$route,$scope,$location,$routeParams) {
  $scope.messages = {};
  $scope.message = {};
  $scope.messageDet = {};
  $scope.totalItems = 0;
  $scope.views = {};
  $scope.views.list = true;
  $scope.selectedAll = false;
  $scope.searchUsers = false;
  $scope.repeatCheck = true;
  $scope.form = {};
  $scope.messageBefore;
  $scope.messageAfter;
  $scope.searchResults = {};
  var routeData = $route.current;
  var currentMessageRefreshId;
  var messageId;

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  $scope.showMessage = function(id){
    $scope.repeatCheck = true;
    showHideLoad();
    dataFactory.httpRequest('messages/'+id).then(function(data) {
      data = successOrError(data);
      if(data){
        messageId = id;
        $scope.changeView('read');
        $scope.message = data.messages.reverse();
        $scope.messageDet = data.messageDet;
        if($scope.message[0]){
          $scope.messageBefore = $scope.message[0].dateSent;
        }
        if($scope.message[$scope.message.length - 1]){
          $scope.messageAfter = $scope.message[$scope.message.length - 1].dateSent;
        }
        currentMessageRefreshId = setInterval(currentMessagePull, 2000);
        $("#chat-box").slimScroll({ scrollTo: $("#chat-box").prop('scrollHeight')+'px' });
      }
      showHideLoad(true);
    });
  }

  getResultsPage(1);
  if($routeParams.messageId){
    $scope.showMessage($routeParams.messageId);
  }

  function getResultsPage(pageNumber) {
     dataFactory.httpRequest('messages/listAll/'+pageNumber).then(function(data) {
      $scope.messages = data.messages;
      $scope.totalItems = data.totalItems;
      showHideLoad(true);
    });
  }

  $scope.linkUser = function(){
      $scope.modalTitle = $rootScope.phrase.searchUsers;
      $scope.searchUsers = !$scope.searchUsers;
  }

  $scope.searchUserButton = function(){
    var searchAbout = $('#searchKeyword').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.minCharLength3);
      return;
    }
    dataFactory.httpRequest('messages/searchUser/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(student){
      $scope.form.toId = student.username;
      $scope.searchUsers = !$scope.searchUsers;
  }


  $scope.checkAll = function(){
    if ($scope.selectedAll) {
      $scope.selectedAll = true;
    } else {
      $scope.selectedAll = false;
    }
    angular.forEach($scope.messages, function (item) {
      item.selected = $scope.selectedAll;
    });
  }

  $scope.loadOld = function(){
    dataFactory.httpRequest('messages/before/'+$scope.messageDet.fromId+'/'+$scope.messageDet.toId+'/'+$scope.messageBefore).then(function(data) {
      angular.forEach(data, function (item) {
        $scope.message.splice(0, 0,item);
      });
      if(data.length == 0){
        $('#loadOld').hide();
      }
      $scope.messageBefore = $scope.message[0].dateSent;
    });
  }

  $scope.markRead = function(){
    $scope.form.items = [];
    angular.forEach($scope.messages, function (item, key) {
      if($scope.messages[key].selected){
        $scope.form.items.push(item.id);
        $scope.messages[key].messageStatus = 0;
      }
    });
    dataFactory.httpRequest('messages/read',"POST",{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
    });
  }

  $scope.markUnRead = function(){
    $scope.form.items = [];
    angular.forEach($scope.messages, function (item, key) {
      if($scope.messages[key].selected){
        $scope.form.items.push(item.id);
        $scope.messages[key].messageStatus = 1;
      }
    });
    dataFactory.httpRequest('messages/unread',"POST",{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
    });
  }

  $scope.markDelete = function(){
    $scope.form.items = [];
    var len = $scope.messages.length
    while (len--) {
      if($scope.messages[len].selected){
        $scope.form.items.push($scope.messages[len].id);
        $scope.messages.splice(len,1);
      }
    }
    dataFactory.httpRequest('messages/delete',"POST",{},$scope.form).then(function(data) {
      response = apiResponse(data,'remove');
    });
  }

  var currentMessagePull = function(){
    if('#/messages/'+messageId == location.hash){
      dataFactory.httpRequest('messages/ajax/'+$scope.messageDet.fromId+'/'+$scope.messageDet.toId+'/'+$scope.messageAfter).then(function(data) {
        angular.forEach(data, function (item) {
          $scope.message.push(item);
          $("#chat-box").slimScroll({ scrollTo: $("#chat-box").prop('scrollHeight')+'px' });
        });
        if($scope.message[$scope.message.length - 1]){
          $scope.messageAfter = $scope.message[$scope.message.length - 1].dateSent;
        }
      });
    }else{
      clearInterval(currentMessageRefreshId);
    }
  };

  $scope.replyMessage = function(){
    if($scope.form.reply != ""){
        $scope.form.disable = true;
        $scope.form.toId = $scope.messageDet.toId;
        dataFactory.httpRequest('messages/'+$scope.messageDet.id,'POST',{},$scope.form).then(function(data) {
          $("#chat-box").slimScroll({ scrollTo: $("#chat-box").prop('scrollHeight')+'px' });
          $scope.form = {};
        });
    }
  }

  $scope.sendMessageNow = function(){
    dataFactory.httpRequest('messages','POST',{},$scope.form).then(function(data) {
      $location.path('/messages/'+data.messageId);
   });
  }

  $scope.changeView = function(view){
    if(view == "read" || view == "list" || view == "create"){
      $scope.form = {};
    }
    if(view == "list" || view == "create"){
      clearInterval(currentMessageRefreshId);
    }
    $scope.views.list = false;
    $scope.views.read = false;
    $scope.views.create = false;
    $scope.views[view] = true;
  }
});

schoex.controller('onlineExamsController', function(dataFactory,$rootScope,$scope,$sce) {
  $scope.classes = {};
  $scope.subject = {};
  $scope.onlineexams = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.marksExam ;
  $scope.marks = {};
  $scope.takeData = {};
  $scope.form.examQuestion = [];
  $scope.userRole ;

  $scope.showModal = false;
  $scope.studentProfile = function(id){
    dataFactory.httpRequest('students/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  dataFactory.httpRequest('onlineExams/listAll').then(function(data) {
    $scope.classes = data.classes;
    $scope.subject = data.subjects;
    $scope.onlineexams = data.onlineExams;
    $scope.userRole = data.userRole;
    showHideLoad(true);
  });

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.examClass}).then(function(data) {
          $scope.subject = data;
      });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('onlineExams/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.onlineexams.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('onlineExams','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.onlineexams.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('onlineExams/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      $scope.subject = $scope.form.subject;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    console.log($scope.form);
    dataFactory.httpRequest('onlineExams/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.onlineexams = apiModifyTable($scope.onlineexams,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.addQuestion = function(){
    if (typeof $scope.examTitle === "undefined" || $scope.examTitle == "") {
      alert($rootScope.phrase.examTitleUndefined);
      return ;
    }

    var questionData = {};
    questionData.title = $scope.examTitle;
    questionData.type = $scope.examQType;

    if (typeof $scope.ans1 != "undefined" && $scope.ans1 != "") {
      questionData.ans1 = $scope.ans1;
    }
    if (typeof $scope.ans2 != "undefined" && $scope.ans2 != "") {
      questionData.ans2 = $scope.ans2;
    }
    if (typeof $scope.ans3 != "undefined" && $scope.ans3 != "") {
      questionData.ans3 = $scope.ans3;
    }
    if (typeof $scope.ans4 != "undefined" && $scope.ans4 != "") {
      questionData.ans4 = $scope.ans4;
    }
    if (typeof $scope.Tans != "undefined" && $scope.Tans != "") {
      questionData.Tans = $scope.Tans;
    }
    if (typeof $scope.Tans1 != "undefined" && $scope.Tans1 != "") {
      questionData.Tans1 = $scope.Tans1;
    }
    if (typeof $scope.Tans2 != "undefined" && $scope.Tans2 != "") {
      questionData.Tans2 = $scope.Tans2;
    }
    if (typeof $scope.Tans3 != "undefined" && $scope.Tans3 != "") {
      questionData.Tans3 = $scope.Tans3;
    }
    if (typeof $scope.Tans4 != "undefined" && $scope.Tans4 != "") {
      questionData.Tans4 = $scope.Tans4;
    }

    $scope.form.examQuestion.push(questionData); console.log($scope.form.examQuestion);
    $scope.examTitle = "";
    $scope.ans1 = "";
    $scope.ans2 = "";
    $scope.ans3 = "";
    $scope.ans4 = "";
    $scope.Tans = "";
    $scope.Tans1 = "";
    $scope.Tans2 = "";
    $scope.Tans3 = "";
    $scope.Tans4 = "";
  }

  $scope.removeQuestion = function(index){
    $scope.form.examQuestion.splice(index,1);
  }


  $scope.take = function(id){
    showHideLoad();
    dataFactory.httpRequest('onlineExams/take/'+id,'POST',{},{}).then(function(data) {
      response = apiResponse(data,'add');
      if(response){
          $scope.changeView('take');
          $scope.takeData = data;
          document.getElementById('onlineExamTimer').start();
          if(data.timeLeft != 0){
              $scope.$broadcast('timer-set-countdown', data.timeLeft);
          }
      }
    });
    showHideLoad(true);
  }

  $scope.finishExam = function(){
      $scope.submitExam();
      alert($rootScope.phrase.examTimedOut);
  }

  $scope.submitExam = function(){
    showHideLoad();
    dataFactory.httpRequest('onlineExams/took/'+$scope.takeData.id,'POST',{},$scope.takeData).then(function(data) {
      if (typeof data.grade != "undefined") {
        alert($rootScope.phrase.examYourGrade+data.grade);
      }else{
        alert($rootScope.phrase.examSubmitionSaved);
      }
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.marksData = function(id){
    showHideLoad();
    dataFactory.httpRequest('onlineExams/marks/'+id).then(function(data) {
      $scope.marks = data;
      $scope.marksExam = id;
      $scope.changeView('marks');
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
      $scope.form.examQuestion = [];
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.take = false;
    $scope.views.marks = false;
    $scope.views[view] = true;
  }
});

schoex.controller('TransportsController', function(dataFactory,$scope,$rootScope) {
  $scope.transports = {};
  $scope.transportsList = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.userRole = $rootScope.dashboardData.role;

  dataFactory.httpRequest('transports/listAll').then(function(data) {
    $scope.transports = data;
    showHideLoad(true);
  });

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('transports/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('transports/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.transports = apiModifyTable($scope.transports,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('transports/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.transports.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('transports','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.transports.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.list = function(id){
    showHideLoad();
    dataFactory.httpRequest('transports/list/'+id).then(function(data) {
      $scope.changeView('listSubs');
      $scope.transportsList = data;
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.listSubs = false;
    $scope.views[view] = true;
  }
});

schoex.controller('mediaController', function($rootScope,dataFactory,CSRF_TOKEN,$scope) {
  $scope.albums = {};
  $scope.media = {};
  $scope.dirParent = -1;
  $scope.dirNow = 0;
  $scope.current = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.userRole = $rootScope.dashboardData.role;
  $scope.form = {};
  $scope.CSRF_TOKEN = CSRF_TOKEN;

  dataFactory.httpRequest('media/listAll').then(function(data) {
    $scope.albums = data.albums;
    $scope.media = data.media;
    $scope.dirParent = -1;
    $scope.dirNow = 0;
    showHideLoad(true);
  });

  $scope.chDir = function(id){
    showHideLoad();
    dataFactory.httpRequest('media/listAll/'+id).then(function(data) {
      $scope.albums = data.albums;
      $scope.media = data.media;
      if(data.current){
        $scope.current = data.current;
        $scope.dirParent = data.current.albumParent;
        $scope.dirNow = id;
      }else{
        $scope.current = {};
        $scope.dirParent = -1;
        $scope.dirNow = 0;
      }
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.saveAlbum = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.albums.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.removeAlbum = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.removeAlbum);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('media/album/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.albums.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.editAlbumData = function(id){
    showHideLoad();
    dataFactory.httpRequest('media/editAlbum/'+id).then(function(data) {
      $scope.changeView('editAlbum');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEditAlbum = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();

      $scope.albums = apiModifyTable($scope.albums,response.id,response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.saveMedia = function(content){
    response = apiResponse(content,'add');
    if(content.status == "success"){
      showHideLoad();

      $scope.media.push(response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.editItem = function(id){
    showHideLoad();
    dataFactory.httpRequest('media/'+id).then(function(data) {
      $scope.changeView('editMedia');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEditItem = function(content){
    response = apiResponse(content,'edit');
    if(content.status == "success"){
      showHideLoad();

      $scope.media = apiModifyTable($scope.media,response.id,response);
      $scope.changeView('list');
    }
    showHideLoad(true);
  }

  $scope.removeItem = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('media/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.media.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.addAlbum = false;
    $scope.views.editAlbum = false;
    $scope.views.addMedia = false;
    $scope.views.editMedia = false;
    $scope.views[view] = true;
  }
});

schoex.controller('staticController', function(dataFactory,$routeParams,$scope,$sce,$rootScope) {
  $scope.staticPages = {};
  $scope.views = {};
  $scope.form = {};
  $scope.userRole = $rootScope.dashboardData.role;
  $scope.pageId = $routeParams.pageId;

  if (typeof $scope.pageId != "undefined" && $scope.pageId != "") {
    showHideLoad();
    dataFactory.httpRequest('static/'+$scope.pageId).then(function(data) {
      $scope.changeView('show');
      $scope.form.pageTitle = data.pageTitle;
      $scope.form.pageContent = $sce.trustAsHtml(data.pageContent);
      showHideLoad(true);
    });
  }else{
    dataFactory.httpRequest('static/listAll').then(function(data) {
      $scope.staticPages = data;
      $scope.changeView('list');
      showHideLoad(true);
    });
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('static','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.staticPages.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('static/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('static/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.staticPages = apiModifyTable($scope.staticPages,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('static/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.staticPages.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.pageActive = function(id){
    showHideLoad();
    dataFactory.httpRequest('static/active/'+id).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        angular.forEach($scope.staticPages, function (item) {
            if(item.id == response.id){
                if(item.pageActive == 1){
                    item.pageActive = 0;
                }else{
                    item.pageActive = 1;
                }
            }
        });
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.show = false;
    $scope.views.listSubs = false;
    $scope.views[view] = true;
  }
});

schoex.controller('attendanceStatsController', function(dataFactory,$scope,$sce) {
  $scope.attendanceStats = {};
  $scope.attendanceData = {};
  $scope.userRole;
  $scope.views = {};
  $scope.form = {};

  $scope.showModal = false;
  $scope.studentProfile = function(id){
    dataFactory.httpRequest('students/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  $scope.subjectList = function(){
      dataFactory.httpRequest('dashboard/subjectList','POST',{},{"classes":$scope.form.classId}).then(function(data) {
          $scope.subjects = data;
      });
  }

  dataFactory.httpRequest('attendance/stats').then(function(data) {
    $scope.attendanceStats = data;
    if(data.role == "admin" || data.role == "teacher"){
      $scope.views.list = true;
    }else if(data.role == "student"){
      $scope.changeView('lists');
    }else if(data.role == "parent"){
      $scope.changeView('listp');
    }
    $scope.userRole = data.attendanceModel;
    showHideLoad(true);
  });

  $scope.statsAttendance = function(){
    showHideLoad();
    dataFactory.httpRequest('attendance/stats','POST',{},$scope.form).then(function(data) {
      if(data){
        $scope.attendanceData = data;
        $scope.changeView('listdata');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.listdata = false;
    $scope.views.lists = false;
    $scope.views.listp = false;
    $scope.views[view] = true;
  }
});

schoex.controller('pollsController', function(dataFactory,$scope,$rootScope) {
  $scope.polls = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('polls/listAll').then(function(data) {
    $scope.polls = data;
    showHideLoad(true);
  });

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('polls/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.polls.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.addPollOption = function(item){
    var optionTitle = prompt($rootScope.phrase.voteOptionTitle);
    if (optionTitle != null) {
      if (typeof $scope.form.pollOptions === "undefined" || $scope.form.pollOptions == "") {
        $scope.form.pollOptions = [];
      }
      var newOption = {'title':optionTitle};
      $scope.form.pollOptions.push(newOption);
    }
  }

  $scope.removePollOption = function(item,index){
    $scope.form.pollOptions.splice(index,1);
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('polls/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('polls/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.polls = apiModifyTable($scope.polls,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('polls','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.polls.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.makeActive = function(id){
    showHideLoad();
    dataFactory.httpRequest('polls/active/'+id,'POST',{}).then(function(data) {
        response = apiResponse(data,'edit');
        if(data.status == "success"){
            angular.forEach($scope.polls, function (item) {
              item.pollStatus = 0;
              if(item.id == response.id){
                  item.pollStatus = 1;
              }
            });
        }
        showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('mailsmsTemplatesController', function(dataFactory,$scope) {
  $scope.templates = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('MailSMSTemplates/listAll').then(function(data) {
    $scope.templates = data;
    showHideLoad(true);
  });

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('MailSMSTemplates/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('MailSMSTemplates/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('dormitoriesController', function(dataFactory,$rootScope,$scope) {
  $scope.dormitories = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('dormitories/listAll').then(function(data) {
    $scope.dormitories = data;
    showHideLoad(true);
  });

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('dormitories/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('dormitories/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.dormitories = apiModifyTable($scope.dormitories,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('dormitories/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.dormitories.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('dormitories','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.dormitories.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('paymentsController', function(dataFactory,$scope,$sce,$rootScope) {
  $scope.payments = {};
  $scope.students = {};
  $scope.classes = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.invoice = {};
  $scope.payDetails = {};
  $scope.userRole = $rootScope.dashboardData.role;

  $scope.showModal = false;
  $scope.studentProfile = function(id){
    dataFactory.httpRequest('students/profile/'+id).then(function(data) {
      $scope.modalTitle = data.title;
      $scope.modalContent = $sce.trustAsHtml(data.content);
      $scope.showModal = !$scope.showModal;
    });
  };

  $scope.linkStudent = function(){
    $scope.modalTitle = $rootScope.phrase.selectStudents;
    $scope.showModalLink = !$scope.showModalLink;
  }

  $scope.linkStudentButton = function(){
    var searchAbout = $('#searchLink').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.minCharLength3);
      return;
    }
    dataFactory.httpRequest('payments/searchUsers/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(student){
      if(!$scope.form.paymentStudent){
          $scope.form.paymentStudent = [];
      }
      console.log($scope.form.paymentStudent);
    $scope.form.paymentStudent.push({'id':student.id,'name':student.name});
    $scope.showModalLink = !$scope.showModalLink;
  }

  $scope.totalItems = 0;
  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  getResultsPage(1);
  function getResultsPage(pageNumber) {
    if(! $.isEmptyObject($scope.paymentsTemp)){
        dataFactory.httpRequest('payments/search/'+$scope.searchText+'/'+pageNumber).then(function(data) {
          $scope.payments = data.payments;
          $scope.totalItems = data.totalItems;
          showHideLoad(true);
        });
    }else{
        dataFactory.httpRequest('payments/listAll/'+pageNumber).then(function(data) {
          $scope.payments = data.payments;
          $scope.students = data.students;
          $scope.classes = data.classes;
          $scope.totalItems = data.totalItems;
          showHideLoad(true);
        });
    }
  }

  $scope.searchDB = function(){
      if($scope.searchText.length >= 3){
          if($.isEmptyObject($scope.paymentsTemp)){
              $scope.paymentsTemp = $scope.payments ;
              $scope.totalItemsTemp = $scope.totalItems;
              $scope.payments = {};
          }
          getResultsPage(1);
      }else{
          if(! $.isEmptyObject($scope.paymentsTemp)){
              $scope.payments = $scope.paymentsTemp ;
              $scope.totalItems = $scope.totalItemsTemp;
              $scope.paymentsTemp = {};
          }
      }
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('payments/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.payments.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('payments','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
          angular.forEach(response, function (item) {
            $scope.payments.push(item);
          });
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('payments/'+id).then(function(data) {
      $scope.form = data;
      $scope.changeView('edit');
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('payments/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.payments = apiModifyTable($scope.payments,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.seeInvoice = function(id){
    showHideLoad();
    dataFactory.httpRequest('payments/invoice/'+id).then(function(data) {
      $scope.invoice = data;
      $scope.changeView('invoice');
      showHideLoad(true);
    });
  }

  $scope.alertPaidData = function(id){
    showHideLoad();
    dataFactory.httpRequest('payments/details/'+id).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.payDetails = response.data;
        $scope.changeView('details');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views.invoice = false;
    $scope.views.details = false;
    $scope.views[view] = true;
  }
});

schoex.controller('languagesController', function(dataFactory,$rootScope,$scope) {
  $scope.languages = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  $scope.translate = function(){
      $(".phraseList label").each(function(i, current){
            var str = $(current).text();
            if($(current).children('input').val() == ""){
                var str2 = $(current).children('input').val(str);
                $(current).children('input').trigger('input');
            }

        });
      return;
  }

  dataFactory.httpRequest('languages/listAll').then(function(data) {
    $scope.languages = data;
    showHideLoad(true);
  });

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('languages/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('languages/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.languages = apiModifyTable($scope.languages,response.id,response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('languages/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.languages.splice(index,1);
        }
        showHideLoad(true);
      });
    }
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('languages','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(data.status == "success"){
        $scope.languages.push(response);
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('promotionController', function(dataFactory,$rootScope,$scope) {
  $scope.classes = {};
  $scope.students = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.classesArray = [];
  $scope.form.studentInfo = [];

  showHideLoad(true);
  $scope.classesList = function(){
      dataFactory.httpRequest('dashboard/classesList','POST',{},{"academicYear":$scope.form.acYear}).then(function(data) {
          $scope.classes = data;
      });
  }

  $scope.classesPromoteList = function(key){
      dataFactory.httpRequest('dashboard/classesList','POST',{},{"academicYear":$scope.studentsList.students[key].acYear}).then(function(data) {
          $scope.classesArray[key] = data;
      });
  }


  $scope.listStudents = function(){
    showHideLoad();
    dataFactory.httpRequest('promotion/listStudents','POST',{},$scope.form).then(function(data) {
      $scope.studentsList = data;

      angular.forEach(data.students, function(value, key) {
        $scope.classesArray[key] = data.classes;
      });

      $scope.changeView('studentPromote');
      showHideLoad(true);
    });
  }

  $scope.promoteNow = function(){
    showHideLoad();
    dataFactory.httpRequest('promotion','POST',{},{'promote':$scope.studentsList.students}).then(function(data) {
      if(data){
          $scope.studentsPromoted = data;
          $scope.changeView('studentsPromoted');
      }
      showHideLoad(true);
    });
  }

  $scope.linkStudent = function(){
    $scope.modalTitle = $rootScope.phrase.linkStudentParent;
    $scope.showModalLink = !$scope.showModalLink;
  }

  $scope.linkStudentButton = function(){
    var searchAbout = $('#searchLink').val();
    if(searchAbout.length < 3){
      alert($rootScope.phrase.minCharLength3);
      return;
    }
    dataFactory.httpRequest('promotion/search/'+searchAbout).then(function(data) {
      $scope.searchResults = data;
    });
  }

  $scope.linkStudentFinish = function(student){
    $scope.form.studentInfo.push({"student":student.name,"id": "" + student.id + "" });
  }

  $scope.removeStudent = function(index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      for (x in $scope.form.studentInfo) {
        if($scope.form.studentInfo[x].id == index){
          $scope.form.studentInfo.splice(x,1);
          break;
        }
      }
    }
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.studentsPromoted = false;
    $scope.views.studentPromote = false;
    $scope.views[view] = true;
  }
});

schoex.controller('academicYearController', function(dataFactory,$rootScope,$scope) {
  $scope.academicYears = {};
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};

  dataFactory.httpRequest('academic/listAll').then(function(data) {
    $scope.academicYears = data;
    showHideLoad(true);
  });

  $scope.remove = function(item,index){
    var confirmRemove = confirm($rootScope.phrase.sureRemove);
    if (confirmRemove == true) {
      showHideLoad();
      dataFactory.httpRequest('academic/'+item.id,'DELETE').then(function(data) {
        response = apiResponse(data,'remove');
        if(data.status == "success"){
          $scope.academicYears.splice(index,1);
          $rootScope.dashboardData.academicYear = $scope.academicYears;
        }
        showHideLoad(true);
      });
    }
  }

  $scope.edit = function(id){
    showHideLoad();
    dataFactory.httpRequest('academic/'+id).then(function(data) {
      $scope.changeView('edit');
      $scope.form = data;
      showHideLoad(true);
    });
  }

  $scope.saveEdit = function(){
    showHideLoad();
    dataFactory.httpRequest('academic/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(response){
        $scope.academicYears = apiModifyTable($scope.academicYears,response.id,response);
        $rootScope.dashboardData.academicYear = $scope.academicYears;
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.saveAdd = function(){
    showHideLoad();
    dataFactory.httpRequest('academic','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'add');
      if(response){
        if(response.isDefault == 1){
            angular.forEach($scope.academicYears, function (item) {
              item.isDefault = 0;
            });
        }
        $scope.academicYears.push({"id":response.id,"yearTitle":response.yearTitle,"isDefault":response.isDefault});
        $rootScope.dashboardData.academicYear = $scope.academicYears;
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.makeActive = function(id){
    showHideLoad();
    dataFactory.httpRequest('academic/active/'+id,'POST',{}).then(function(data) {
      response = apiResponse(data,'edit');
      if(response){
          angular.forEach($scope.academicYears, function (item) {
            item.isDefault = 0;
            if(item.id == response.id){
                item.isDefault = 1;
            }
          });
          $rootScope.dashboardData.academicYear = $scope.academicYears;
        $scope.changeView('list');
      }
      showHideLoad(true);
    });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
});

schoex.controller('vacationController', function(dataFactory,$rootScope,$scope) {
  $scope.views = {};
  $scope.views.list = true;
  $scope.form = {};
  $scope.vacation ;

  showHideLoad(true);
  $scope.getVacation = function(){
    showHideLoad();
    dataFactory.httpRequest('vacation','POST',{},$scope.form).then(function(data) {
      response = apiResponse(data,'edit');
      if(data.status == "success"){
        $scope.vacation = response;
        $scope.changeView('lists');
      }
      showHideLoad(true);
    });
  }

  $scope.confirmVacation = function(){
      showHideLoad();
      dataFactory.httpRequest('vacation/confirm','POST',{},{'days':$scope.vacation.days}).then(function(data) {
        response = apiResponse(data,'edit');
        if(data.status == "success"){
          $scope.changeView('list');
        }
        showHideLoad(true);
      });
  }

  $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.lists = false;
    $scope.views[view] = true;
  }
});
schoex.controller('permissionsController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
  $scope.permissions = {};
	$scope.permissionform={}
  $scope.views = {};
  $scope.views.list = true;
  $scope.CSRF_TOKEN = CSRF_TOKEN;

    $scope.go
getlistsPage();
   function getlistsPage() {
	   
		
	   dataFactory.httpRequest('users/getRoles').then(function(data) {
      $scope.newroles = data.userroles;
	 
	});
	 dataFactory.httpRequest('permissions/getPermissions/1').then(function(data) {
      $scope.assignpermissions = data.permissions;
	 
	});
	dataFactory.httpRequest('permissions/getPermissions/2').then(function(data) {
      $scope.attendacepermissions = data.permissions;
	 
	});
	dataFactory.httpRequest('permissions/getPermissions/3').then(function(data) {
      $scope.gradebooks = data.permissions;
	 
	});
	dataFactory.httpRequest('permissions/getPermissions/4').then(function(data) {
      $scope.staffattendances = data.permissions;
	 
	});
	  showHideLoad(true);
   }
  
   $scope.editpermission = function(moduleId,permission,roleId,moduleName){
	    dataFactory.httpRequest('users/fetchRoles/'+roleId).then(function(data) {
	$scope.roleName = data.role;
	 $scope.modalTitle = "Edit Permission for "+ data['role'] ;
	});
   
	$scope.moduleId = moduleId;
	$scope.roleId = roleId;
	$scope.permission = permission;
	
    $scope.showModalLink = !$scope.showModalLink;
  }
  
   $scope.editnewpermission = function(permission,moduleId,roleId){
	   $scope.permissionform['moduleId']=moduleId;
	   $scope.permissionform['roleId']=roleId;
	    $scope.permissionform['permission']=permission;
	   dataFactory.httpRequest('permissions/update','POST',{}, $scope.permissionform).then(function(data) {	
	     
      if(data == 1){
		    $scope.showModalLink = !$scope.showModalLink;
      showHideLoad();
       getlistsPage();
	    $.gritter.add({
            title: 'Update Permissions',
            text: 'Permission Updated successfully',
			  image: "../assets/img/gritter_edit.png"
          });
      }
      showHideLoad(true);
	   });
   
  }

   $scope.changeView = function(view){
    if(view == "add" || view == "list" || view == "show"){
      $scope.form = {};
    }
    $scope.views.list = false;
    $scope.views.add = false;
    $scope.views.edit = false;
    $scope.views[view] = true;
  }
  

  

 
});

schoex.controller('mycampusController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
	 showHideLoad();
	 showHideLoad(true);
});
schoex.controller('exammanagmentController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
	 showHideLoad();
	 showHideLoad(true);
});

schoex.controller('noticeboardController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
	 showHideLoad();
	 showHideLoad(true);
});
schoex.controller('permanentachievController', function(dataFactory,CSRF_TOKEN,$scope,$sce) {
	 showHideLoad();
	 showHideLoad(true);
});