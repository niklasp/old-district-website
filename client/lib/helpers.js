

global.TimeFromBlockheight = function(currentBlock, targetBlockheight){
    let secondsToStart = BlocksToSeconds(targetBlockheight - currentBlock);
    return moment().add(secondsToStart,'seconds').unix();
};

global.isScrolledIntoView = function(elem) {
    var docViewTop = $(window).scrollTop();

    var elemTop = $(elem).offset().top;

    return (elemTop <= docViewTop);
};