import '../styles/_index.scss';
import Sketch from './district3d.js';
import DistrictVR from './districtvr';

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    new Sketch({
      dom: document.getElementById( 'threejs-container' )
    });
    new DistrictVR();
  },
  false
);




