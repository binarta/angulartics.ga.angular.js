(function (angular) {
    angular.module('angularticsx.ga', ['angularticsx.ga.services', 'binarta-applicationjs-angular1'])
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

    angular.module('angularticsx.ga.services', ['ngRoute', 'angularx', 'config', 'angulartics', 'angulartics.google.analytics', 'angulartics.google.tagmanager', 'binarta-applicationjs-angular1'])
        .config(['$analyticsProvider', function ($analyticsProvider) {
            $analyticsProvider.virtualPageviews(false);
        }])
        .service('analyticsService', ['$rootScope', '$location', '$analytics', 'config', 'resourceLoader', 'binarta', AnalyticsServiceScheduler]);

    function AnalyticsServiceScheduler($rootScope, $location, $analytics, config, resourceLoader, binarta) {
        var previousPath, isPageBeingTracked;
        var gaStatus = {
            loadStarted: false,
            loadComplete: false
        };
        var gtmStatus = {
            loadStarted: false,
            loadComplete: false
        };
        var self = this;

        this.schedule = function () {
            self.loadGA({deferPageTrack: true});
            self.loadGTM({deferPageTrack: true});
        };

        this.loadGA = function (opt) {
            if (gaStatus.loadStarted) return;
            gaStatus.loadStarted = true;
            if (!isAnalyticsFeatureEnabled() && !isSharedAnalyticsEnabled()) {
                gaStatus.loadComplete = true;
                return;
            }

            binarta.schedule(function () {
                binarta.application.config.findPublic('analytics.ga.key', function (key) {
                    if (key || isSharedAnalyticsEnabled()) loadAnalyticsScript(function () {
                        if (key) initGAKey(key, 'custom');
                        if (isSharedAnalyticsEnabled()) initGAKey(config.sharedAnalytics);
                        gaStatus.loadComplete = true;
                        opt && opt.deferPageTrack ? deferredInitPageTrack() : initPageTrack();
                    });
                    else gaStatus.loadComplete = true;
                });
            });
        };

        this.loadGTM = function (opt) {
            if (gtmStatus.loadStarted) return;
            gtmStatus.loadStarted = true;
            if (!isAnalyticsFeatureEnabled()) {
                gtmStatus.loadComplete = true;
                return;
            }

            binarta.schedule(function () {
                binarta.application.config.findPublic('analytics.gtm.key', function (key) {
                    if (key) loadGTMScript(key, function () {
                        gtmStatus.loadComplete = true;
                        opt && opt.deferPageTrack ? deferredInitPageTrack() : initPageTrack();
                    });
                    else gtmStatus.loadComplete = true;
                });
            });
        };

        function isAnalyticsFeatureEnabled() {
            return config.analytics && config.analytics !== 'false';
        }

        function isSharedAnalyticsEnabled() {
            return config.sharedAnalytics && config.sharedAnalytics !== 'false';
        }

        function loadAnalyticsScript(cb) {
            resourceLoader.getScript('//www.google-analytics.com/analytics.js').then(cb);
        }

        function loadGTMScript(key, cb) {
            resourceLoader.getScript('//www.googletagmanager.com/gtm.js?id=' + key).then(cb);
        }

        function initGAKey(key, name) {
            if (name) {
                ga('create', key, 'auto', { name: name });
                $analytics.settings.ga.additionalAccountNames = [name];
            }
            else ga('create', key, 'auto');
        }

        function deferredInitPageTrack() {
            if (!areAllScriptsLoaded()) return;
            initPageTrack();
        }

        function initPageTrack() {
            if (isPageBeingTracked) return;
            isPageBeingTracked = true;
            pageTrack();
            $rootScope.$on('$routeChangeSuccess', pageTrack);
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

        function areAllScriptsLoaded() {
            return gaStatus.loadComplete && gtmStatus.loadComplete;
        }
    }
})(angular);