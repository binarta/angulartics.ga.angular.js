module.exports = function(config) {
    config.set({
        basePath:'../',
        frameworks:['jasmine'],
        files:[
            {pattern:'bower_components/angular/angular.js'},
            {pattern:'bower_components/angular-mocks/angular-mocks.js'},
            {pattern:'bower_components/thk-config-mock/src/config.mock.js'},
            {pattern:'bower_components/angulartics/src/angulartics.js'},
            {pattern:'bower_components/angulartics/src/angulartics-ga.js'},
            {pattern:'src/**/*.js'},
            {pattern:'test/**/*.js'}
        ],
        browsers:['PhantomJS']
    });
};