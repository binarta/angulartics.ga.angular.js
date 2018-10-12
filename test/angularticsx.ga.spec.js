describe('angularticsx.ga', function () {
    beforeEach(module('angularticsx.ga.services'));

    var $rootScope, config, binarta, resourceLoader, $analytics, $location, analyticsService;

    beforeEach(inject(function (_$rootScope_, _configReader_, _config_, _binarta_, _resourceLoader_, _$analytics_, _$location_, _analyticsService_) {
        $rootScope = _$rootScope_;
        reader = _configReader_;
        config = _config_;
        binarta = _binarta_;
        resourceLoader = _resourceLoader_;
        $analytics = _$analytics_;
        $location = _$location_;
        analyticsService = _analyticsService_;
        ga = jasmine.createSpy('ga');
        $location.path('/test');
    }));

    afterEach(inject(function (localStorage) {
        localStorage.removeItem('cookiesAccepted');
    }));

    describe('analyticsService', function () {
        function triggerBinartaSchedule() {
            binarta.application.adhesiveReading.read('-');
        }

        function assertSharedAnalytics() {
            describe('when shared analytics key present', function () {
                beforeEach(function () {
                    config.sharedAnalytics = 'shared-key';
                    analyticsService.schedule();
                    triggerBinartaSchedule();
                });

                it('analytics script is loaded', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledWith('//www.google-analytics.com/analytics.js');
                });

                describe('on script loaded', function () {
                    beforeEach(function () {
                        resourceLoader.getScriptDeferred.resolve();
                        $rootScope.$digest();
                    });

                    it('ga shared key is created', function () {
                        expect(ga).toHaveBeenCalledWith('create', 'shared-key', 'auto');
                        expect(ga.calls.count()).toEqual(1);
                    });

                    it('track current path', function () {
                        expect($analytics.pageTrack).toHaveBeenCalledWith('/test');
                    });

                    describe('on route change', function () {
                        beforeEach(function () {
                            $location.path('/new/path');
                            $rootScope.$broadcast('$routeChangeSuccess');
                        });

                        it('track new path', function () {
                            expect($analytics.pageTrack).toHaveBeenCalledWith('/new/path');
                        });
                    });
                });
            });
        }

        it('disable virtualPageviews within angulartics module', function () {
            expect($analytics.virtualPageviewsSpy).toEqual(false);
        });

        describe('when analytics is disabled', function () {
            beforeEach(function () {
                config.analytics = false;
                binarta.application.gateway.clear();
            });

            assertSharedAnalytics();
        });

        describe('when analytics is enabled', function () {
            beforeEach(function () {
                config.sharedAnalytics = undefined;
                config.analytics = true;
                binarta.application.gateway.clear()
            });

            assertSharedAnalytics();

            describe('and given an Analytics key', function () {
                beforeEach(function () {
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.ga.key', value: 'ga-key' });
                    analyticsService.schedule();
                    triggerBinartaSchedule();
                });

                it('analytics script is loaded', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledWith('//www.google-analytics.com/analytics.js');
                });

                describe('on script loaded', function () {
                    beforeEach(function () {
                        resourceLoader.getScriptDeferred.resolve();
                        $rootScope.$digest();
                    });

                    it('ga key is created', function () {
                        expect(ga).toHaveBeenCalledWith('create', 'ga-key', 'auto', { name: 'custom' });
                        expect(ga.calls.count()).toEqual(1);
                    });

                    it('angulartics is configured for additional tracker', function () {
                        expect($analytics.settings.ga.additionalAccountNames).toEqual(['custom']);
                    });

                    it('track current path', function () {
                        expect($analytics.pageTrack).toHaveBeenCalledWith('/test');
                    });

                    describe('on route change', function () {
                        beforeEach(function () {
                            $location.path('/new/path');
                            $rootScope.$broadcast('$routeChangeSuccess');
                        });

                        it('track new path', function () {
                            expect($analytics.pageTrack).toHaveBeenCalledWith('/new/path');
                        });
                    });

                    describe('on route changed multiple times with same path', function () {
                        beforeEach(function () {
                            $analytics.pageTrack.calls.reset();
                            $location.path('/new/path');
                            $rootScope.$broadcast('$routeChangeSuccess');
                            $rootScope.$broadcast('$routeChangeSuccess');
                        });

                        it('path has been tracked once', function () {
                            expect($analytics.pageTrack.calls.count()).toEqual(1);
                        });
                    });
                });
            });

            describe('and given an Google Tag Manager key', function () {
                beforeEach(function () {
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.gtm.key', value: 'gtm-key' });
                    analyticsService.schedule();
                    triggerBinartaSchedule();
                });

                it('gtm script is loaded', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledWith('//www.googletagmanager.com/gtm.js?id=gtm-key');
                });

                describe('on script loaded', function () {
                    beforeEach(function () {
                        resourceLoader.getScriptDeferred.resolve();
                        $rootScope.$digest();
                    });

                    it('track current path', function () {
                        expect($analytics.pageTrack).toHaveBeenCalledWith('/test');
                    });
                });
            });

            describe('when given both a gtm key and a ga key', function () {
                beforeEach(function () {
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.ga.key', value: 'ga-key' });
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.gtm.key', value: 'gtm-key' });
                    analyticsService.schedule();
                    triggerBinartaSchedule();
                });

                describe('on scripts loaded', function () {
                    beforeEach(function () {
                        resourceLoader.getScriptDeferred.resolve();
                        $rootScope.$digest();
                    });

                    it('current path is tracked once', function () {
                        expect($analytics.pageTrack).toHaveBeenCalledTimes(1);
                    });
                });
            });
        });
    });
});