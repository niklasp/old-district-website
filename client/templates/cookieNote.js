
Template.cookieNote.helpers({
   hideCookieNote() {
       return localStorage.getItem('cookieNoteAccepted');
   }
});
Template.cookieNote.events({
    'click a.close'(event, instance) {
        event.preventDefault();
        localStorage.setItem('cookieNoteAccepted', true);
        instance.$('.cookieNote').hide();
    }
});
