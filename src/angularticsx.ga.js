angular.module('angularticsx.ga', ['config', 'angulartics', 'angulartics.google.analytics'])
    .run(['$location', '$analytics', 'config', 'configReader',
        function($location, $analytics, config, configReader) {
            if (config.analytics && config.analytics != 'false'){
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function () {
                            (i[r].q = i[r].q || []).push(arguments)
                        }, i[r].l = 1 * new Date();

                    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m);
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

                if (config.sharedAnalytics && config.sharedAnalytics != 'false') ga('create', config.sharedAnalytics, 'auto');
                
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