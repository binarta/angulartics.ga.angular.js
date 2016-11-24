angular.module('angularx', [])
    .service('resourceLoader', function ($q) {
        this.getScriptDeferred = $q.defer();
        this.getScript = jasmine.createSpy('getScript').and.returnValue(this.getScriptDeferred.promise);
    });