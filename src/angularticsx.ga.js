(function (angular) {
    angular.module('angularticsx.ga', ['ngRoute', 'angularx', 'config', 'angulartics', 'angulartics.google.analytics', 'angulartics.google.tagmanager', 'binarta-applicationjs-angular1'])
        .config(['$analyticsProvider', function ($analyticsProvider) {
            $analyticsProvider.virtualPageviews(false);
        }])
        .service('analyticsService', ['$rootScope', '$location', '$analytics', 'config', 'resourceLoader', 'binarta', AnalyticsServiceScheduler])
        .run(['binarta', 'analyticsService', function (binarta, analyticsService) {
            if (binarta.application.cookies.permission.status == 'permission-granted') {
                analyticsService.schedule();
            }
            binarta.application.cookies.permission.eventRegistry.add({
                granted: function () {
                    analyticsService.schedule();
                }
            });
        }]);

    function AnalyticsServiceScheduler($rootScope, $location, $analytics, config, resourceLoader, binarta) {
        this.schedule = function () {
            binarta.schedule(function () {
                var previousPath;

                if (!isAnalyticsEnabled() && !isSharedAnalyticsEnabled()) return;

                binarta.application.config.findPublic('analytics.gtm.key', function (key) {
                    if (key) loadGTMScript(key);
                });

                binarta.application.config.findPublic('analytics.ga.key', function (key) {
                    if (key || isSharedAnalyticsEnabled()) loadAnalyticsScript(key);
                });

                $rootScope.$on('$routeChangeSuccess', pageTrack);

                function isAnalyticsEnabled() {
                    return config.analytics && config.analytics !== 'false';
                }

                function isSharedAnalyticsEnabled() {
                    return config.sharedAnalytics && config.sharedAnalytics !== 'false';
                }

                function loadAnalyticsScript(key) {
                    resourceLoader.getScript('//www.google-analytics.com/analytics.js').then(function () {
                        initAnalytics(key);
                    });
                }

                function loadGTMScript(key) {
                    resourceLoader.getScript('//www.googletagmanager.com/gtm.js?id=' + key).then(function () {
                        pageTrack();
                    });
                }

                function initAnalytics(key) {
                    if (isSharedAnalyticsEnabled()) initSharedKey();
                    if (key) initCustomKey(key);
                    pageTrack();
                }

                function initSharedKey() {
                    ga('create', config.sharedAnalytics, 'auto');
                }

                function initCustomKey(key) {
                    ga('create', key, 'auto', { name: 'custom' });
                    $analytics.settings.ga.additionalAccountNames = ['custom'];
                }

                function pageTrack() {
                    var path = $location.path();
                    if (isNotOnSamePath(path)) $analytics.pageTrack(path);
                }

                function isNotOnSamePath(path) {
                    var isNotSamePath = previousPath !== path;
                    previousPath = path;
                    return isNotSamePath;
                }
            });
        }
    }
})(angular);