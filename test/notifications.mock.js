angular.module('notifications', [])
        .service('topicMessageDispatcher', function () {
            return jasmine.createSpyObj('topicMessageDispatcher', ['fire']);
        })
        .service('topicRegistry', function () {
            this.subscribe = jasmine.createSpy('subscribe');
            this.unsubscribe = jasmine.createSpy('unsubscribe');
        });