describe('angularticsx.ga', function() {
    beforeEach(module('angularticsx.ga'));
    beforeEach(module('binartajs-angular1-spec'));

    var $rootScope, config, reader, binarta, resourceLoader, $analytics, $location;

    beforeEach(inject(function(_$rootScope_, _configReader_, _config_, _binarta_, _resourceLoader_, _$analytics_, _$location_) {
        $rootScope = _$rootScope_;
        reader = _configReader_;
        config = _config_;
        binarta = _binarta_;
        resourceLoader = _resourceLoader_;
        $analytics = _$analytics_;
        $location = _$location_;
        ga = jasmine.createSpy('ga');
        $location.path('/test');
    }));

    function triggerBinartaSchedule() {
        binarta.application.adhesiveReading.read('-');
    }

    function assertSharedAnalytics() {
        describe('when shared analytics key present', function () {
            beforeEach(function () {
                config.sharedAnalytics = 'shared-key';
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
        beforeEach(function() {
            config.analytics = false;
            binarta.application.gateway.clear()
        });

        assertSharedAnalytics();
    });

    describe('when analytics is enabled', function () {
        beforeEach(function() {
            config.sharedAnalytics = undefined;
            config.analytics = true;
            binarta.application.gateway.clear()
        });

        assertSharedAnalytics();

        describe('and given an Analytics key', function () {
            beforeEach(function () {
                binarta.application.gateway.addPublicConfig({id: 'analytics.ga.key', value: 'ga-key'});
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
                    expect(ga).toHaveBeenCalledWith('create', 'ga-key', 'auto', {name: 'custom'});
                    expect(ga.calls.count()).toEqual(1);
                });

                it('angulartics is configured for additional tracker', function() {
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

        describe('with multiple languages', function () {
            beforeEach(function () {
                binarta.application.gateway.updateApplicationProfile({supportedLanguages: ['en', 'nl']});
                binarta.application.refresh();
                binarta.application.setLocaleForPresentation('en');
                triggerBinartaSchedule();
            });

            describe('and is on unlocalized path', function () {
                beforeEach(function () {
                    $location.path('/path');
                    $rootScope.$broadcast('$routeChangeSuccess');
                });

                it('path is not tracked', function () {
                    expect($analytics.pageTrack).not.toHaveBeenCalled();
                });
            });

            describe('and is on localized path', function () {
                beforeEach(function () {
                    $location.path('/en/path');
                    $rootScope.$broadcast('$routeChangeSuccess');
                });

                it('path is tracked', function () {
                    expect($analytics.pageTrack).toHaveBeenCalledWith('/en/path');
                });
            });
        });
    });
});