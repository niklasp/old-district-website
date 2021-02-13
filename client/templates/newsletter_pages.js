import $ from 'jquery';

Template.newsletter_pages.onRendered(function newsletter_pagesOnRendered() {
    let template = this;
    let video3 = template.$(".newsletter video.bgvideo-single");
    let video3loop = template.$(".newsletter video.bgvideo-loop");
    video3loop.hide();

    // play bg video 3
    video3.get(0).play();
    video3.get(0).addEventListener("ended", ()=>{
        video3loop.show();
        video3.hide();
    });
    video3loop.get(0).play();

    $(".components").css('z-index', 3); // safari fix
});