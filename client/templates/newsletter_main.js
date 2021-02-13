import $ from 'jquery';

Template.newsletter_main.onRendered(function newsletter_mainOnRendered() {
    let template = this;
    let video3 = template.$(".newsletter video.bgvideo-single");
    let video3loop = template.$(".newsletter video.bgvideo-loop");
    video3loop.hide();
    // play bg video 3

    // If we are on the mainpage
    let started = false;
    let scrollDelayTimeout;
    $(window).on('scroll', function (e) {
        clearTimeout(scrollDelayTimeout);
        scrollDelayTimeout = setTimeout(function () {
            if (!started && global.isScrolledIntoView('.call-to-action')) {
                started = true;
                $(window).unbind('scroll');

                video3.get(0).play();
                video3.get(0).addEventListener("ended", ()=>{
                    video3loop.show();
                    video3.hide();
                });
                video3loop.get(0).play();

                $(".components").css('z-index', 3); // safari fix
            }
        },100);
    });


});