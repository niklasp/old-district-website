import $ from 'jquery';


let audioFile = '14_beatloop_techno02_filtered_125bpm_1minute.mp3';
let whiteScreen = 'screens_white.jpg';
let blackScreen = 'screens_off.jpg';


let strobeInterval;

function startStrobe(template) {

    template.$('.slogan').hide();
    template.$('.coming-soon').show();

    template.$('section.hero').css({'background-image': "url('/images/bg/"+ whiteScreen +"')"});

    strobeInterval = setInterval(()=>{
        template.$('section.hero').css({'background-image': "url('/images/bg/"+ whiteScreen +"')"});

        setTimeout(()=> {
            template.$('section.hero').css({'background-image': "url('/images/bg/"+ blackScreen +"')"});
        }, 20);
    }, 490)
}

function stopStrobe(template) {
    template.$('section.hero').css({'background-image': "url('/images/bg/"+ blackScreen +"')"});
    clearInterval(strobeInterval);
}

Template.mainPage.onRendered(function mainOnRendered() {
    let template = this;

    template.audio = new Audio('/audio/'+ audioFile);
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
