describe('angularticsx.ga', function() {
    angular.module('angulartics.mock', []).factory('$analytics', function() {
        return {
            settings: {
                ga: {
                    additionalAccountNames:undefined
                },
                pageTracking:{
                    basePath:'base-path/'
                }
            }
        }
    });

    beforeEach(module('config'));
    beforeEach(module('angularticsx.ga'));
    beforeEach(module('angulartics.mock'));

    describe('on run', function() {
        var config, ga = jasmine.createSpy('ga'), reader;

        beforeEach(inject(function(_configReader_, _config_) {
            reader = _configReader_;
            config = _config_;
        }));

        it('config reader is not executed', function() {
            expect(reader.calls[0]).toBeUndefined();
        });

        describe('with analytics enabled', function() {
            beforeEach(inject(function($analytics, $location) {
                config.analytics = true;
                window.ga = ga;
                var run = angular.module('angularticsx.ga')._runBlocks[0];
                run[run.length-1](config, reader, $analytics, $location);
            }));

            function read() {
                return reader.calls[0].args[0];
            }

            it('config is read', function() {
                expect(read().$scope).toEqual({});
                expect(read().key).toEqual('analytics.ga.key');
                expect(read().scope).toEqual('public');
            });

            describe('on success', function() {
                beforeEach(function() {
                    reader.calls[0].args[0].success({value:'code'});
                });

                it('new tracker gets installed with ga', function() {
                    expect(ga.calls[0].args).toEqual(['create', 'code', 'auto', {name:'custom'}]);
                });

                it('angulartics is configured for additional tracker', inject(function($analytics) {
                    expect($analytics.settings.ga.additionalAccountNames).toEqual(['custom']);
                }));

                it('manually send a pageview to ga for the installed tracker', inject(function($location) {
                    expect(ga.calls[1].args).toEqual(['custom.send', 'pageview', 'base-path/' + $location.url()])
                }));
            });
        });
    });
});