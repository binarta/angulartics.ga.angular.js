describe('angularticsx.ga.services', function () {
    beforeEach(module('angularticsx.ga.services'));

    var $rootScope, config, binarta, resourceLoader, $analytics, $location, sut;

    beforeEach(inject(function (_$rootScope_, _configReader_, _config_, _binarta_, _resourceLoader_, _$analytics_, _$location_, _analyticsService_) {
        $rootScope = _$rootScope_;
        reader = _configReader_;
        config = _config_;
        binarta = _binarta_;
        resourceLoader = _resourceLoader_;
        $analytics = _$analytics_;
        $location = _$location_;
        sut = _analyticsService_;
        ga = jasmine.createSpy('ga');
        $location.path('/test');
    }));

    afterEach(inject(function (localStorage) {
        localStorage.removeItem('cookiesAccepted');
    }));

    it('disable virtualPageviews within angulartics module', function () {
        expect($analytics.virtualPageviewsSpy).toEqual(false);
    });

    describe('analyticsService', function () {
        function triggerBinartaSchedule() {
            binarta.application.adhesiveReading.read('-');
        }

        function assertSharedAnalytics() {
            describe('assert shared analytics', function () {
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

        describe('when analytics feature is disabled', function () {
            beforeEach(function () {
                config.analytics = false;
            });

            describe('and no GA key and no shared key present', function () {
                beforeEach(function () {
                    triggerBinartaSchedule();
                });

                describe('on schedule', function () {
                    beforeEach(function () {
                        sut.schedule();
                    });

                    it('analytics script is not loaded', function () {
                        expect(resourceLoader.getScript).not.toHaveBeenCalled();
                    });
                });

                describe('on loadGA', function () {
                    beforeEach(function () {
                        sut.loadGA();
                    });

                    it('analytics script is not loaded', function () {
                        expect(resourceLoader.getScript).not.toHaveBeenCalled();
                    });
                });
            });

            describe('and no GTM key present', function () {
                beforeEach(function () {
                    triggerBinartaSchedule();
                });

                describe('on schedule', function () {
                    beforeEach(function () {
                        sut.schedule();
                    });

                    it('gtm script is not loaded', function () {
                        expect(resourceLoader.getScript).not.toHaveBeenCalled();
                    });
                });

                describe('on loadGTM', function () {
                    beforeEach(function () {
                        sut.loadGTM();
                    });

                    it('analytics script is not loaded', function () {
                        expect(resourceLoader.getScript).not.toHaveBeenCalled();
                    });
                });
            });

            describe('and shared ga key is present', function () {
                beforeEach(function () {
                    config.sharedAnalytics = 'shared-key';
                    triggerBinartaSchedule();
                });

                describe('on schedule', function () {
                    beforeEach(function () {
                        sut.schedule();
                    });

                    assertSharedAnalytics();
                });

                describe('on loadGA', function () {
                    beforeEach(function () {
                        sut.loadGA();
                    });

                    assertSharedAnalytics();
                });
            });
        });

        describe('when analytics is enabled', function () {
            beforeEach(function () {
                config.analytics = true;
            });

            describe('and shared ga key is present', function () {
                beforeEach(function () {
                    config.sharedAnalytics = 'shared-key';
                    triggerBinartaSchedule();
                });

                describe('on schedule', function () {
                    beforeEach(function () {
                        sut.schedule();
                    });

                    assertSharedAnalytics();
                });

                describe('on loadGA', function () {
                    beforeEach(function () {
                        sut.loadGA();
                    });

                    assertSharedAnalytics();
                });
            });

            describe('and given an Analytics key', function () {
                beforeEach(function () {
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.ga.key', value: 'ga-key' });
                    sut.schedule();
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
                    sut.schedule();
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

            describe('when both GA and GTM are used and pageTrack is defered', function () {
                beforeEach(function () {
                    $analytics.pageTrack.calls.reset();
                    resourceLoader.getScript.calls.reset();
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.ga.key', value: 'ga-key' });
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.gtm.key', value: 'gtm-key' });                    
                    triggerBinartaSchedule();
                });

                describe('when only GA is loaded', function () {
                    beforeEach(function () {
                        sut.loadGA({deferPageTrack: true});
                    });

                    describe('on script loaded', function () {
                        beforeEach(function () {
                            resourceLoader.getScriptDeferred.resolve();
                            $rootScope.$digest();
                        });
    
                        it('current path is not tracked yet', function () {
                            expect($analytics.pageTrack).not.toHaveBeenCalled();
                        });

                        describe('when GTM is loaded', function () {
                            beforeEach(function () {
                                sut.loadGTM({deferPageTrack: true});
                            });

                            describe('on script loaded', function () {
                                beforeEach(function () {
                                    resourceLoader.getScriptDeferred.resolve();
                                    $rootScope.$digest();
                                });

                                it('current path is tracked ', function () {
                                    expect($analytics.pageTrack).toHaveBeenCalled();
                                });
                            });
                        });
                    });
                });
            });

            describe('when given both a gtm key and a ga key', function () {
                beforeEach(function () {
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.ga.key', value: 'ga-key' });
                    binarta.application.gateway.addPublicConfig({ id: 'analytics.gtm.key', value: 'gtm-key' });
                    sut.schedule();
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

            describe('calling schedule more than once', function () { 
                beforeEach(function () {
                    triggerBinartaSchedule();
                    sut.schedule();
                    sut.schedule();
                    sut.schedule();
                });

                it('script is loaded twice', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledTimes(2);
                });
            });
            
            describe('calling loadGA more than once', function () { 
                beforeEach(function () {
                    triggerBinartaSchedule();
                    sut.loadGA();
                    sut.loadGA();
                    sut.loadGA();
                });

                it('script is loaded only once', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledTimes(1);
                });
            });
            
            describe('calling loadGTM more than once', function () { 
                beforeEach(function () {
                    triggerBinartaSchedule();
                    sut.loadGTM();
                    sut.loadGTM();
                    sut.loadGTM();
                });

                it('script is loaded only once', function () {
                    expect(resourceLoader.getScript).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});