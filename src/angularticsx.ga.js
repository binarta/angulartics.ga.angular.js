angular.module('angularticsx.ga', ['config', 'angulartics', 'angulartics.google.analytics'])
    .run(['config', 'configReader', '$analytics', '$location', function(config, configReader, $analytics, $location) {
        if (config.analytics && window.ga) {
            configReader({
                $scope:{},
                key:'analytics.ga.key',
                scope:'public',
                success: function(data) {
                    ga('create', data.value, 'auto', {name:'custom'});
                    $analytics.settings.ga.additionalAccountNames = ['custom'];
                    ga('custom.send', 'pageview', $analytics.settings.pageTracking.basePath + $location.url())
                }
            });
        }
    }]);