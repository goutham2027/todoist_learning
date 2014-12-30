
app = angular.module('todo', []);

app.factory('toDo', function ($http) {
    return {
        getToDoList: function () {
            return $http.get('/todo/tasks');
        },
        postToDoList: function(data) {
            return $http.post('/todo/create', data);
        },
        updateToDoList: function(data) {
            return $http.put('/todo/task/update', data);
        }
    }
})

var isNew = function(item) {
    var curDateTime = new Date();
    if( (!item.done) && (item.enddatetime - curDateTime > 0)) {
        return true;
    }
    else return false;
};

var isDelayed = function (item) {

    var curDateTime = new Date();
    if ( (item.enddatetime.getDate() - curDateTime.getDate() === 0)
        && (item.enddatetime.getTime() - curDateTime.getTime() < 0)) {
        return true;
    }
    else {  return false };
};

var isCarry = function(item) {
    var curDateTime = new Date();
    if ( curDateTime.getDate() - item.enddatetime.getDate()   >= 1) {
        return true;
    }
    else {  return false };
};

app.controller("todoCtrl", function ($scope, toDo) {
    $scope.today = new Date();
    $scope.item = {};
    var promise = toDo.getToDoList();

    promise.then(
        function (answer) {
            $scope.todolist = answer.data;

           for(var i=0; i<$scope.todolist.length; i++) {

                $scope.todolist[i].enddatetime = new Date($scope.todolist[i].enddatetime);
                $scope.todolist[i].createdatetime = new Date($scope.todolist[i].createdatetime);
                $scope.todolist[i].finisheddatetime = new Date($scope.todolist[i].finisheddatetime);
            }
        },
        function(error) {
            $q.reject(error);
        })


    $scope.summarydisp = {new: 0, delayed: 0, carry: 0};
    $scope.addTask = function (item) {

        var date = new Date(item.date + " " + item.tasktime);
        console.log(date)
        var todoitem = {
            task: item.task,
            enddatetime: date.toJSON(),
            createdatetime: new Date().toJSON(),
            done: false
        };
        var promise = toDo.postToDoList(todoitem);
        promise.success(function(data){
                console.log(data);
            if(data.status === 'OK') {
                todoitem.enddatetime = new Date(todoitem.enddatetime);
                todoitem.createdatetime = new Date(todoitem.createdatetime);
                todoitem.id = data.id;
                $scope.todolist.push(todoitem);
                $scope.item = {};
            }
            else if(data.status === 'NOK') {
            }
        }).error(function(data)
        {
            console.log("failed");
        })


        console.log($scope.summary)
    }

    // to change class of the circle
    $scope.colorcode = function(index) {
        var curDateTime = new Date();
        if ($scope.todolist[index].done && (! isDelayed($scope.todolist[index]) && ! isCarry($scope.todolist[index]))) {
            return 'done'
        }
        else if (  $scope.todolist[index].done && ( isDelayed($scope.todolist[index]) || isCarry($scope.todolist[index]))) {
            return 'delayed'
        }
        else if ( (! $scope.todolist[index].done) && ($scope.todolist[index].enddatetime - curDateTime) < 0  ) {
            return 'redcircle'
        }
        else {
            return 'NA'
        }
    }

    // to change todo item status
    $scope.updateTaskStatus = function(index) {
        var id = $scope.todolist[index].id;
        var fdt = new Date();
        var promise  =  toDo.updateToDoList({'id': id, 'finisheddatetime': fdt.toJSON()});
        promise.success(function(answer){
                $scope.todolist[index].done = ! $scope.todolist[index].done;
                $scope.todolist[index].finisheddatetime = fdt;
        }).error(function(){

            });
    };

    $scope.showToday = function(index) {
        var curDateTime = new Date();
        var item = $scope.todolist[index];
        if(item.done && item.finisheddatetime.getDate() != curDateTime.getDate()) {
            return false;
        }
        else {
            return true
        }
    }
    // compute summary
    $scope.$watch('todolist', function(){
        if (typeof $scope.todolist === 'undefined') return;
        $scope.summary = {new: 0, delayed: 0, carry: 0};
        for(var i=0; i<$scope.todolist.length; i++) {
            var item = $scope.todolist[i];
            if(isNew(item)) {
             $scope.summary.new += 1;
            }
            else if(!(item.done) && isDelayed(item)) {
                $scope.summary.delayed += 1;
            }
            else if(!(item.done) && isCarry(item)) {
                $scope.summary.carry +=1;
            }
        }
    }, true)

    // summary
    $scope.$watch('summary', function() {
        if (typeof $scope.todolist === 'undefined') return;
        if($scope.summary.new > 10 ) {
            $scope.summarydisp.new = '10+'
        }
        else {
            $scope.summarydisp.new = $scope.summary.new;
        }
        if($scope.summary.delayed > 10 ) {
            $scope.summarydisp.delayed = '10+'
        }
        else {
            $scope.summarydisp.delayed = $scope.summary.delayed;
        }
        if($scope.summary.carry > 10 ) {
            $scope.summarydisp.carry = '10+'
        }
        else {
            $scope.summarydisp.carry = $scope.summary.carry;
        }
    },true)


});


app.directive('datepicker', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            $(element).datetimepicker({
                pickTime: false
            });
        }
    }
});

app.directive('timepicker', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            $(element).datetimepicker({
                pickDate: false
            });
        }
    }
});

