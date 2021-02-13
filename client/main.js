import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// disconnect any meteor server
// if(location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
//     Meteor.disconnect();

import './lib/router.js';
import './lib/helpers.js';


// templates
import './body.html';
import './templates/layout/layoutMain.html';
import './templates/layout/layoutPage.html';
import './templates/layout/layoutWiki.html';
import './templates/layout/footer.html';
import './templates/layout/navBar.html';
import './templates/cookieNote.html';
import './templates/cookieNote.js';
import './templates/mainPage.html';
import './templates/mainPage.js';
import './templates/newsletter.html';
import './templates/newsletter_main.html';
import './templates/newsletter_main.js';
import './templates/newsletter_pages.html';
import './templates/newsletter_pages.js';
import './templates/imprint.html';
import './templates/privacy.html';

import './templates/countdownPage.html';
import './templates/countdownPage.js';
