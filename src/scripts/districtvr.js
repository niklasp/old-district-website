import { ScrollSpy, Modal } from "bootstrap";
import Swiper, { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../images/club-entrance.jpg';


export default function DistrictVR() {
  let postContainer = document.querySelector( '.medium-posts' );
  let mediumArticles;

  const updateMediumArticles = ( articles ) => {
    const domArticles = [ ...postContainer.querySelectorAll( '.post' ) ];
    articles.items.splice( 2 );

    [ ...articles.items ].forEach( ( a, idx) => {
      updateArticle( domArticles[ idx ], a );
    });
  };

  const navButton = document.querySelector('button.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = mobileMenu?.querySelectorAll( 'a' );

  if ( navLinks ) {
    [ ...navLinks ].forEach( link => {
      link.addEventListener( 'click', () => {
        mobileMenu.classList.remove( 'open' );
        navButton.classList.remove( 'is-active' );
      });
    });
  }

  navButton?.addEventListener( 'click', () => {
    navButton.classList.toggle( 'is-active' );
    mobileMenu.classList.toggle( 'open' );
  });

  const updateArticle = ( domEl, article ) => {
    if ( ! domEl ) {
      return;
    }

    const dateOptions = {year: 'numeric', month: 'long', day: 'numeric' };

    const image = domEl.querySelector('img');
    const title = domEl.querySelector('h4');
    const desc = domEl.querySelector('.description');
    const more = domEl.querySelector('.more a');
    const cats = domEl.querySelector('.categories');
    const date = domEl.querySelector( '.post-date' );

    image.src = article.thumbnail;
    title.innerHTML = article.title;
    more.href = article.link;
    desc.innerHTML = article.description;
    const newP = desc.querySelector( 'p:first-of-type' );
    desc.innerHTML = newP.innerHTML;
    cats.innerHTML = article.categories.join( ', ' );
    date.innerHTML = article.pubDate ? new Date( article.pubDate ).toLocaleDateString('en-US', dateOptions) : '';

//     $re = '/(<p>.*?<\/p>)/m';
// preg_match_all($re, $str, $matches, PREG_SET_ORDER, 0);
  };

  const initSwiper = () => {
    const swiper = new Swiper('.swiper', {
      modules: [ Navigation, Pagination ],
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      on: {
        click: function ( e ) {
          e.slideNext();
        },
      },
    });
  };

  const init = () => {
    if ( postContainer ) {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/thedistrictvr')
      .then( resp => resp.json() )
      .then( articles => updateMediumArticles( articles ) )
      .catch( () => {
        if ( postContainer.querySelector( '.post-wrap' ) ) {
          postContainer.querySelector( '.post-wrap' ).innerHTML =
            '<div class="col text-center" style="color: var(--color-secondary)"><p>Error getting posts from Medium, please try again later or navigate to medium directly with the link below.<p></div>';
        }
      });
    }

    new ScrollSpy(document.body, {
      target: '#main-nav',
    });

    initSwiper();
  };



  init();
}