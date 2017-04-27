angular.module('angularticsx.ga', ['ngRoute', 'angularx', 'config', 'angulartics', 'angulartics.google.analytics', 'binarta-applicationjs-angular1'])
    .config(['$analyticsProvider', function ($analyticsProvider) {
        $analyticsProvider.virtualPageviews(false);
    }])
    .run(['$rootScope', '$location', '$analytics', 'config', 'resourceLoader', 'binarta', function ($rootScope, $location, $analytics, config, resourceLoader, binarta) {
        binarta.schedule(function () {
            var previousPath;

            if (!isAnalyticsEnabled() && !isSharedAnalyticsEnabled()) return;

            function isAnalyticsEnabled() {
                return config.analytics && config.analytics !== 'false';
            }

            function isSharedAnalyticsEnabled() {
                return config.sharedAnalytics && config.sharedAnalytics !== 'false';
            }

            binarta.application.config.findPublic('analytics.ga.key', function (key) {
                if (key || isSharedAnalyticsEnabled()) loadAnalyticsScript(key);
                else trackPageViews();
            });

            function loadAnalyticsScript(key) {
                resourceLoader.getScript('//www.google-analytics.com/analytics.js').then(function () {
                    initAnalytics(key)
                });
            }

            function initAnalytics(key) {
                if (isSharedAnalyticsEnabled()) initSharedKey();
                if (key) initCustomKey(key);
                trackPageViews();
            }

            function initSharedKey() {
                ga('create', config.sharedAnalytics, 'auto');
            }

            function initCustomKey(key) {
                ga('create', key, 'auto', {name: 'custom'});
                $analytics.settings.ga.additionalAccountNames = ['custom'];
            }

            function trackPageViews() {
                pageTrack();
                $rootScope.$on('$routeChangeSuccess', pageTrack);
            }

            function pageTrack() {
                var path = $location.path();
                if (isNotOnSamePath(path) && (hasNoMultipleLanguages() || isNotOnUnlocalizedPath()))
                    $analytics.pageTrack(path);
            }

            function isNotOnSamePath(path) {
                var isNotSamePath = previousPath !== path;
                previousPath = path;
                return isNotSamePath;
            }

            function hasNoMultipleLanguages() {
                return binarta.application.supportedLanguages() <= 1;
            }

            function isNotOnUnlocalizedPath() {
                return $location.path() !== binarta.application.unlocalizedPath();
            }
        });
    }]);