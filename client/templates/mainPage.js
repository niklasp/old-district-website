import $ from 'jquery';

Template.mainPage.onRendered(function mainOnRendered() {
    let template = this;

    // Play boxes videos only on scroll
    let started = false;
    let scrollDelayTimeout;
    $(window).on('scroll', function (e) {
        clearTimeout(scrollDelayTimeout);
        scrollDelayTimeout = setTimeout(function () {

            if (!started && $(window).scrollTop() > 10) { //global.isScrolledIntoView('.call-to-action')
                started = true;

                // play all videos
                template.$("video.lukso-bg-loop").each(async (i, video) => {
                    video.playbackRate = 1;
                    try {
                        await video.play();

                        // IF autoplay failed, show images, instead of video
                    } catch (e) {
                        template.$(".inner-video").hide();
                        template.$(".inner-images").show();
                    }
                });
            }
        });
    });

    // Play bg videos on start
    let video1 = template.$(".hero video.bgvideo-single");
    let video1loop = template.$(".hero video.bgvideo-loop");
    video1.get(0).play();

    video1.get(0).addEventListener("ended", () => {
        video1loop.show();
        video1.hide();
    });
    video1loop.hide();
    video1loop.get(0).play();


    // play bg video 2
    let video2 = template.$(".middle-chain-divider video.bgvideo-single");
    let video2loop = template.$(".middle-chain-divider video.bgvideo-loop");
    video2loop.hide();
    template.timeout2 = setTimeout(function () {
        video2.get(0).play();
        video2.get(0).addEventListener("ended", () => {
            video2loop.show();
            video2.hide();
        });
        video2loop.get(0).play();
    }, 7.5 * 1000);

});

Template.mainPage.onDestroyed(function mainOnDestroyed() {
    clearTimeout(this.timeout2);
});

Template.mainPage.helpers({
    // counter() {
    //     return Template.instance().counter.get();
    // },
});

// Template.mainPage.events({
//     'click video'(event, instance) {
//         event.currentTarget.play();
//     },
// });
