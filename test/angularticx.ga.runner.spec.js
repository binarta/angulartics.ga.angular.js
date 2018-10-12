describe('angularticsx.ga.runner', function () {
    beforeEach(module('angularticsx.ga'));

    var analyticsService, binarta;

    beforeEach(inject(function (_analyticsService_, _binarta_) {
        analyticsService = _analyticsService_;
        binarta = _binarta_;
    }));

    describe('Default run on module injection -', function () {
        it('Should schedule the analytics on receiving the "cookies.accepted" event', function () {
            spyOn(analyticsService, 'schedule');
            binarta.application.cookies.permission.grant();
            expect(analyticsService.schedule).toHaveBeenCalled();
        });
    });
});