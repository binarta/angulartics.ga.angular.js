angular.module('angulartics', [])
    .provider('$analytics', function () {
        var virtualPageviewsSpy;

        this.virtualPageviews = function (isEnabled) {
            virtualPageviewsSpy = isEnabled;
        };
        this.$get = function () {
            return {
                virtualPageviewsSpy: virtualPageviewsSpy,
                pageTrack: jasmine.createSpy('pageTrack'),
                settings: {
                    ga: {
                        additionalAccountNames: undefined
                    }
                }
            }
        };
    });

angular.module('angulartics.google.analytics', []);
angular.module('angulartics.google.tagmanager', []);