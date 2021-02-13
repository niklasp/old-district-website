BlazeLayout.setRoot('body');

// FlowRouter.route('*', {
//     action: function() {
//         BlazeLayout.render('layoutMain', {main: 'mainPage'});
//     }
// });


FlowRouter.notFound = {
    action: function() {
        FlowRouter.go("/");
    }
};


FlowRouter.route('/', {
    action: function() {
        BlazeLayout.render('layoutMain', {main: 'mainPage'});
        // BlazeLayout.render('countdownPage');
    }
});

FlowRouter.route('/privacy', {
    action: function() {
        BlazeLayout.render('layoutPage', {main: 'privacy'});
    }
});

FlowRouter.route('/imprint', {
    action: function() {
        BlazeLayout.render('layoutPage', {main: 'imprint'});
    }
});

