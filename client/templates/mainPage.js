import $ from 'jquery';

let strobeInterval;

function startStrobe(template) {
    template.$('section.hero').css({'background-image': "url('/images/bg/screens_white.jpg')"});
    strobeInterval = setInterval(()=>{
        template.$('section.hero').css({'background-image': "url('/images/bg/screens_white.jpg')"});

        setTimeout(()=> {
            template.$('section.hero').css({'background-image': "url('/images/bg/screens_off.jpg')"});
        }, 20);
    }, 500)
};

function stopStrobe(template) {
    template.$('section.hero').css({'background-image': "url('/images/bg/screens_off.jpg')"});
    clearInterval(strobeInterval);
}

Template.mainPage.onRendered(function mainOnRendered() {
    let template = this;

    template.audio = new Audio('/audio/04_beatloop_techno02_filtered_125BPM.mp3');
    template.audio.loop = true;

    // let started = false;
    // let scrollDelayTimeout;
    // $(window).on('scroll', function (e) {
    //     clearTimeout(scrollDelayTimeout);
    //     scrollDelayTimeout = setTimeout(function () {
    //         console.log('scroll')
    //
    //         if (!started && $(window).scrollTop() > 0) {
    //             started = true;
    //             console.log('play')
    //
    //             template.audio.play();
    //         }
    //     }, 100);
    // });
    //
    // template.audio.play();

});

Template.mainPage.onDestroyed(function mainOnDestroyed() {
});

Template.mainPage.helpers({
    // counter() {
    //     return Template.instance().counter.get();
    // },
});

Template.mainPage.events({
    'click .play-music, click .hero'(event, instance) {
        event.preventDefault();

        if(instance.audio.paused) {
            instance.audio.play();
            startStrobe(instance);
        } else {
            instance.audio.pause();
            stopStrobe(instance);
        }

    },
    'click .stop-music'(event, instance) {
        event.preventDefault();
        instance.audio.pause();
    },
});
