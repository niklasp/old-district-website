import * as THREE from 'three';
import Wave from '@foobar404/wave';
import {
  filter,
} from 'lodash';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
// core version + navigation, pagination modules:
import Swiper, { Navigation, Pagination } from 'swiper';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import GUI from 'lil-gui';

import Stats from 'stats.js';

import { monitorScroll, monitorWheel, ColorGUIHelper } from './util';
import screenFragmentShader from '../shaders/screenFragmentShader.glsl';
import floorFragmentShader from '../shaders/floorFragmentShader.glsl';
import ceilingFragmentShader from '../shaders/ceilingFragmentShader.glsl';
import followMouseShader from '../shaders/followMouseShader.glsl';
// import { vertexShader } from '../shaders/vertexShader';

//import shaders
import vertexShader from '../shaders/vertexShader.glsl';
// import fragmentShader from '../shaders/fragment.glsl';
import { ShiftShader } from '../shaders/shiftShader.js';
import { TDVRGlitchPass } from '../shaders/GlitchPass';
import { CloneXShader } from '../shaders/cloneXShader.js';

import club from '../models/club/reduce.glb';
// import environment from '../../public/venice_sunset_1k.hdr';
// import environment from '../../public/preller_drive_1k.hdr';
// import environment from '../../public/bg.hdr';
import pot from '../../public/POT.png';
import txSmoke from '../../public/txSmoke.png';

import visuals1 from '../../public/visuals2.mp4';
import visuals2 from '../../public/visuals3.mp4';
import visuals3 from '../../public/visuals.mp4';
import visuals4 from '../../public/visuals4.mp4';
import visuals5 from '../images/sm.mp4';
import logo from '../images/TDVR-Logo-white-glow.png';

export default class Sketch {
  constructor( options ) {

    this.loadModels.bind( this );
    this.loadAudio.bind( this );
    this.clock = new THREE.Clock();
    this.time = 0;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.direction = 1;
    this.scrollPercentage = 0.0;

    this.guiParams = {
      exposure: 1.1,
      bloomStrength: 0.234,
      bloomThreshold: 0.3,
      bloomRadius: 0.22,
      ambLight: {
        color: [ 255, 255, 255 ],
        intensity: 0.15,
      },
      analyserIndex: 1,
      analyserIntensity: 50,
      dirLight1: {
        color: '#6e41ec',
        intensity: 1.0,
        position: {
          x: 0,
          y: -2.12,
          z: -12.96,
        },
        target: {
          position: {
            x: 0,
            y: 1.8,
            z: 20.0,
          }
        },
      },
      dirLight2: {
        color: '#2d4d74',
        intensity: 0.15,
        position: {
          x: 0,
          y: 4.28,
          z: -3.6,
        },
        target: {
          position: {
            x: 0,
            y: 1.8,
            z: 0.32,
          }
        },
      },
      spotLight1: {
        color: '#ffffff',
        intensity: 2.0,
        position: {
          x: 0,
          y: 3.515,
          z: -15.51,
        },
        target: {
          position: {
            x: 0,
            y: 9.40,
            z: -25.0,
          }
        },
      },
      fx: {
        smokeCol: [ 0.81,0.84,1.0 ],
      },
      video: 2,
      videox: true,
      globalvideo: true,
      is3d: true,
      directionalLightIntensity: 0.2,
      envMapIntensity: 0.1,
      light:{},
      postglitch: false,
      postcolor: true,
      postfilm: true,
    };

    this.screenUniforms = {};

    this.loadingDiv = document.getElementById( 'loader' );

    this.container = options.dom;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.mouse = new THREE.Vector2( 0.0, 0.0 );
    this.mouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.oldMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.mouseAcc = new THREE.Vector2( 0.0, 0.0 );
    this.lMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.lMouse = new THREE.Vector2( 0.0, 0.0 );
    
    this.camPos = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pultPos = new THREE.Vector3( 0, 4.5, -22 );

    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;

    this.playBackSpeed = 500;

    this.logo = document.querySelector( '.bottom-logo' );
    this.currentLogo = 1;

    this.nav = document.querySelector( '.navbar-nav' );
    this.currentMode = 0;
    this.modes = [ 'normal', 'difference', 'color-dodge' ];
    this.lerp = 0.1;

    this.time = 0;
    this.vid = document.querySelector( '#bgvid' );

    this.horizontalContainer = document.querySelector( '.horizontal-container' );
    this.hciScroll = null;
    this.lastScrollPos = 0;
    this.scrollTarget = 0;
    this.isScrolling = false;

    this.mouseWX = 10;
    this.mouseWY = 10;
    this.mouseTargetWX = 10;
    this.mouseTargetWY = 10;
    this.relX = 0;
    this.relY = 0;
    this.smoothness = 0.1;
    this.smoothnessTarget = 0.1;

    this.isOverFogEl = false;
    this.isOverInteractive = false;

    this.g_containerInViewport = false;

    console.log( this.width, this.height );

    const fov = 40;
    const near = 0.01;
    const far = 70;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    this.initialCameraPosition = new THREE.Vector3( 0, 7, 26 );
    this.initialCameraTarget = new THREE.Vector3( 0, 8, 0 );
    // this.camera.position.set( ...this.initialCameraPosition );
    // this.camera.applyQuaternion( new THREE.Quaternion( -0.005017613869019601,0.007409255564267864,0.000037178272031372894,0.9999599617488798 ) );
    // this.camera.updateProjectionMatrix();
    // this.scene.add( this.camera );


    // const gridHelper = new THREE.GridHelper( 100, 100 );
    // this.scene.add( gridHelper );

    // const axesHelper = new THREE.AxesHelper(10);
    // this.scene.add( axesHelper );
    // this.scene.overrideMaterial = new THREE.MeshBasicMaterial({color: 'green'});

    // this.stats = new Stats();
    // this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild( this.stats.dom );

    let pixelRatio = window.devicePixelRatio;
    let AA = true;
    if (pixelRatio > 1) {
      AA = false;
    }

    this.renderer = new THREE.WebGLRenderer( {
      antialias: AA,
      // alpha: true,
      autoClear: true,
      powerPreference: "high-performance",
      // preserveDrawingBuffer: true,
    } );

    this.renderer.setSize( this.width, this.height );

    this.container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.object.position.set( ...this.initialCameraPosition );
    this.controls.target = new THREE.Vector3(0,4,-30);
    this.controls.update();
    // this.controls.movementSpeed = 1000;
    // this.controls.domElement = this.renderer.domElement;
    // this.controls.rollSpeed = Math.PI / 12;
    // this.controls.autoForward = false;
    // this.controls.dragToLook = false;

    // this.controls.object.position.set( 0,5.5,22 );
    // this.controls.target = new THREE.Vector3(0, 5.5, 8);
    // this.controls.update();

    this.screenColor = new THREE.Color( 0xffffff );

    this.setupLoading();
    this.setupListeners();
    this.addText();
    // this.loadModels();
    // this.addLights();
    // this.addGUI();
    // this.addObjects();
    this.addComposer();
    this.render();
    this.initSwiper();
    this.resize();
  }

  initSwiper() {
    const swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  addGUI() {
    this.gui = new GUI();
    const that = this;
    // const lightsFolder = this.gui.addFolder( 'Lights' );
    const bloomFolder = this.gui.addFolder( 'Bloom' ).close();

    bloomFolder.add( this.guiParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {
      that.renderer.toneMappingExposure = Math.pow( value, 4.0 );
    } );

    bloomFolder.add( this.guiParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
      that.bloomPass.threshold = Number( value );
    } );

    bloomFolder.add( this.guiParams, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
      that.bloomPass.strength = Number( value );
    } );

    bloomFolder.add( this.guiParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
      that.bloomPass.radius = Number( value );
    } );

    // this.lights.map( ( light, idx ) => {
    //   this.guiParams.light[ `${ idx }Intensity` ] = light.intensity;
    //   this.guiParams.light[ `${ idx }Color` ] = [ light.color.r, light.color.g, light.color.b ];
    //   this.guiParams.light[ `${ idx }Visible` ] = false;
    //   if ( idx === 10 ) {
    //     that.lights[ idx ].intensity = 0;
    //   }
    //   if ( idx === 1 ){
    //     this.guiParams.light[ `${ idx }Intensity` ] = 0.2;
    //   }
    //   if ( idx === 2 ) {
    //     this.guiParams.light[ `${ idx }Color` ] = [ 119,183,80 ];
    //     that.lights[idx].color = new THREE.Color( "rgb(119, 183, 80)" );
    //   }
    //   if ( idx === 3 ) {
    //     this.guiParams.light[ `${ idx }Color` ] = [ 63,40,130 ];
    //   }
      // lightsFolder.add( this.guiParams.light, `${ idx }Intensity`, 0.0, 1.0 ).onChange( function ( value ) {
      //   that.lights[ idx ].intensity = Number( value );
      // } );
      // lightsFolder.addColor( this.guiParams.light, `${ idx }Color`).onChange( function( value ) {
      //   that.lights[ idx ].color = new THREE.Color( parseInt( value[ 0 ] ), parseInt( value[ 1 ] ), parseInt( value[ 2 ] ));
      // });
      // lightsFolder.add( this.guiParams.light, `${ idx }Visible`).onChange( function( value ) {
      //   that.lights[ idx ].visible = value;
      //   console.log( that.lights[ idx ] );
      // });
    // });

    const lightsFolder = this.gui.addFolder( 'Lights' ).close();
    lightsFolder.add( this.guiParams.ambLight, `intensity`, 0.0, 1.0 ).name('ambientintensity').onChange( function ( value ) {
      that.amblight.intensity = value;
    } );

    const fd1 = lightsFolder.addFolder( 'Directional Light 1' ).close();
    fd1.addColor( new ColorGUIHelper( this.dirLight1, 'color'), 'value' ).name( 'Color');
    fd1.add( this.guiParams.dirLight1, 'intensity', 0, 1).onChange( value => this.dirLight1.intensity = value );
    // fd1.add( this.guiParams.dirLight1.position, 'x', -20, 20).name( 'd1x' ).onChange( value => this.dirLight1.position.setX( value ) );
    fd1.add( this.guiParams.dirLight1.position, 'y', -20, 20).name( 'y' ).onChange( value => this.dirLight1.position.setY( value ) );
    fd1.add( this.guiParams.dirLight1.position, 'z', -20, 20).name( 'z' ).onChange( value => this.dirLight1.position.setZ( value ) );
    // fd1.add( this.guiParams.dirLight1.target.position, 'x', -20, 20).name( 'd1tx' ).onChange( value => this.dirLight1.target.position.setX( value ) );
    fd1.add( this.guiParams.dirLight1.target.position, 'y', -20, 20).name( 'target y' ).onChange( value => this.dirLight1.target.position.setY( value ) );
    fd1.add( this.guiParams.dirLight1.target.position, 'z', -20, 20).name( 'target z' ).onChange( value => this.dirLight1.target.position.setZ( value ) );

    const fd2 = lightsFolder.addFolder( 'Directional Light 2' ).close();
    fd2.addColor( new ColorGUIHelper( this.dirLight2, 'color'), 'value' ).name( 'Dir Light 2');
    fd2.add( this.guiParams.dirLight2, 'intensity', 0, 1).onChange( value => this.dirLight2.intensity = value );
    fd2.add( this.guiParams.dirLight2.position, 'x', -20, 20).name( 'x' ).onChange( value => this.dirLight2.position.setX( value ) );
    fd2.add( this.guiParams.dirLight2.position, 'y', -20, 20).name( 'y' ).onChange( value => this.dirLight2.position.setY( value ) );
    fd2.add( this.guiParams.dirLight2.position, 'z', -20, 20).name( 'z' ).onChange( value => this.dirLight2.position.setZ( value ) );
    fd2.add( this.guiParams.dirLight2.target.position, 'x', -20, 20).name( 'target x' ).onChange( value => this.dirLight2.target.position.setX( value ) );
    fd2.add( this.guiParams.dirLight2.target.position, 'y', -20, 20).name( 'target y' ).onChange( value => this.dirLight2.target.position.setY( value ) );
    fd2.add( this.guiParams.dirLight2.target.position, 'z', -20, 20).name( 'target z' ).onChange( value => this.dirLight2.target.position.setZ( value ) );

    const fd3 = lightsFolder.addFolder( 'Spot Light' ).close();
    fd3.addColor( new ColorGUIHelper( this.spotLight1, 'color'), 'value' ).name( 'Spot Light');
    fd3.add( this.guiParams.spotLight1, 'intensity', 0, 3).onChange( value => this.spotLight1.intensity = value );
    fd3.add( this.guiParams.spotLight1.position, 'x', -25, 20).name( 'x' ).onChange( value => this.spotLight1.position.setX( value ) );
    fd3.add( this.guiParams.spotLight1.position, 'y', -25, 20).name( 'y' ).onChange( value => this.spotLight1.position.setY( value ) );
    fd3.add( this.guiParams.spotLight1.position, 'z', -25, 20).name( 'z' ).onChange( value => this.spotLight1.position.setZ( value ) );
    fd3.add( this.guiParams.spotLight1.target.position, 'x', -25, 20).name( 'target x' ).onChange( value => this.spotLight1.target.position.setX( value ) );
    fd3.add( this.guiParams.spotLight1.target.position, 'y', -25, 20).name( 'target y' ).onChange( value => this.spotLight1.target.position.setY( value ) );
    fd3.add( this.guiParams.spotLight1.target.position, 'z', -25, 20).name( 'target z' ).onChange( value => this.spotLight1.target.position.setZ( value ) );
    fd3.add( this.guiParams, 'analyserIndex', 0, 254).step( 1 ).name( 'beat index' ).onChange( value => this.guiParams.analyserIndex = value );
    fd3.add( this.guiParams, 'analyserIntensity', 0, 1000).step( 1 ).name( 'beat intensity' ).onChange( value => this.guiParams.analyserIntensity = value );

    const videoFolder = this.gui.addFolder( 'Video' ).close();
    videoFolder.add( this.guiParams, 'is3d' ).onChange( val => {
      if ( val ) {
        this.container.style.display = 'block';
      } else {
        this.container.style.display = 'none';
      }
    });
    videoFolder.add( this.guiParams, 'video', 1, 5).step(1).onChange( value => {
      const tmp = [ visuals1, visuals2, visuals3, visuals4, visuals5 ];
      this.video.pause();
      this.video.src = tmp[ value - 1 ];
      this.video.load();
      this.video.play();
    });
    videoFolder.add( this.guiParams, 'videox' ).onChange( val => {
      this.screenUniforms.videox.value = val;
    });
    videoFolder.add( this.guiParams, 'globalvideo' ).onChange( val => {
      this.screenUniforms.globalvideo.value = val;
    });

    const postFolder = this.gui.addFolder( 'Postprocessing' ).close();
    postFolder.add( this.guiParams, 'postcolor' ).name( 'Colorstorm' ).onChange( value => {
      // this.guiParams.postcolor = value;
      this.clonexPass.uniforms.postcolor.value = value;
    });
    // postFolder.add( this.guiParams, 'postglitch' ).name( 'Glitch' ).onChange( value => {
    //   // this.guiParams.postglitch = value;
    //   if ( value ) {
    //     this.composer.addPass( this.glitchPass );
    //   } else {
    //     this.composer.removePass( this.glitchPass );
    //   }
    // });
    postFolder.add( this.guiParams, 'postfilm' ).name( 'Film' ).onChange( value => {
      // this.guiParams.postfilm = value;
      this.clonexPass.uniforms.postfilm.value = value;
    });

    const fxFolder = this.gui.addFolder( 'fx' );
    fxFolder.addColor( this.guiParams.fx, 'smokeCol' ).name( 'Smoke Color' ).onChange( value => {
      console.log( value );
      this.followMousePass.uniforms.newCol.value = value;
    });

    // this.gui.close();
  }

  setupLoading() {
    const that = this;
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    this.loadingManager.onLoad = function ( ) {
      console.log( 'Loading complete!');

      if ( typeof that.loadingDiv !== 'undefined' ) {
        that.loadingDiv.classList.add( 'hidden' );
      }
    };

    this.loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

      // When the modal is shown, we want a fixed body
      // document.body.style.position = 'fixed';
      // document.body.style.top = `-${window.scrollY}px`;

      that.updateLoader( `${ (itemsLoaded / itemsTotal * 100).toFixed( 0 ) }%` );
    };

    this.loadingManager.onError = function ( url ) {
      console.log( 'There was an error loading ' + url );
    };
  }

  updateLoader( val ) {
    // this.loadingDiv.querySelector( 'h2' ).innerHTML = val;
  }

  setupListeners() {
    document.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
    window.addEventListener( 'resize', this.resize.bind( this ) );

    [ ...document.querySelectorAll( '.has-fog' ) ].map( ( el ) => {
      el.addEventListener( 'mouseenter', this.onMouseEnter.bind( this ) );
      el.addEventListener( 'mouseleave', this.onMouseLeave.bind( this ) );
    });

    // [ ...document.querySelectorAll( 'button, .swiper-pagination-bullet' ) ].map( ( el ) => {
    //   el.addEventListener( 'mouseenter', this.onMouseEnterInteractive.bind( this ) );
    //   el.addEventListener( 'mouseleave', this.onMouseLeaveInteractive.bind( this ) );
    // });

    // this.logo.addEventListener( 'click', () => {
    //   this.currentLogo += 1;
    //   this.currentLogo = this.currentLogo % 6;
    //   [ ...document.querySelectorAll( '#mousebg > rect' ) ].forEach( ( el ) => {
    //     el.style.display = 'none';
    //   });
    //   document.querySelector( `#mousebg #r${ this.currentLogo + 1 }` ).style.display = 'block';
    // });

    // this.nav.addEventListener( 'click', () => {
    //   this.currentMode += 1;
    //   this.currentMode = this.currentMode % this.modes.length;
    //   document.querySelector( `#mousebg` ).style.mixBlendMode = this.modes[ this.currentMode ];
    // });

    monitorScroll(
      ratio => {
        this.scrollPercentage = (ratio).toFixed(3);
        this.mouseWX *= 0.9;
        this.mouseWY *= 0.9;
      }
    );

    monitorWheel(
      ( scrollTarget ) => {
        this.direction = this.scroll > 0 ? -1 : 1;
        this.scrollTarget = scrollTarget;
      }
    );

    const playbutton = document.getElementById('playbutton');
    const that = this;
    if ( playbutton ) {
      playbutton.addEventListener('click', () => {
        playbutton.classList.toggle( 'out' );

        this.loadAudio();
        if ( ! that.audio.isPlaying ) {
          that.audio.play();
          that.audio.isPlaying = true;
        } else {
          that.audio.pause();
          that.audio.isPlaying = false;
        }

        if ( that.mediaElement.paused && that.mediaElement.currentTime >= 0 && !that.mediaElement.started) {
          that.mediaElement.play();
        } else {
          that.mediaElement.pause();
        }

        if ( ! that.video?.isPlaying ) {
          that.video?.play();
        } else {
          that.video?.pause();
        }
      });
    }
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.composer?.setSize( this.width, this.height );
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  loadAudio() {
    const listener = new THREE.AudioListener();
    this.audio = new THREE.Audio( listener );
    const file = '../../public/TheDistrictVR.mp3';
    this.fftSize = 128;

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
      const that = this;
      const loader = new THREE.AudioLoader();
      loader.load( file, function ( buffer ) {
        that.audio.setBuffer( buffer );
        that.audio.setLoop( true );
      } );
    } else {
      this.mediaElement = new Audio( file );
      this.mediaElement.loop = true;
      this.audio.setMediaElementSource( this.mediaElement );
    }

    this.analyser = new THREE.AudioAnalyser( this.audio, this.fftSize );
    this.analyser.analyser.smoothingTimeConstant = 0.95;
    this.audioFormat = THREE.LuminanceFormat;
    this.screenUniforms.tAudioData = { value: new THREE.DataTexture( this.analyser.data, this.fftSize / 2, 1, this.audioFormat ) };
  }

  loadModels() {
    const that = this;

    this.video = document.getElementById( 'bgvid' );
    this.video.src = visuals5;
    this.video.load();
    this.vTexture = new THREE.VideoTexture( this.video );
    // this.vTexture.minFilter = THREE.LinearFilter;
    // this.vTexture.magFilter = THREE.LinearFilter;
    // this.vTexture.format = THREE.RGBFormat;

    this.screenUniforms = {
      u_time: { value: 0.0 },
      pixelSize: { value: 10 },
      u_resolution: { value: new THREE.Vector2( this.width, this.height ) },
      u_mouse: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
      u_mouseSpeed: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
      u_video: { value: this.vTexture },
      tAudioData: { value: new THREE.DataTexture() },
      videox: { value: true },
      globalvideo: { value: true },
      postfilm: { value: true },
      postglitch: { value: false },
      postcolor: { value: true },
    },

    this.screenMaterial = new THREE.ShaderMaterial({
      uniforms: this.screenUniforms,
      vertexShader,
      fragmentShader: screenFragmentShader,
    });

    this.floorMaterial = new THREE.ShaderMaterial({
      uniforms: this.screenUniforms,
      vertexShader,
      fragmentShader: floorFragmentShader,
      transparent: true,
    });

    this.colorMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });

    // this.screenMaterial = new THREE.MeshPhongMaterial({
    //   map: this.vTexture,
    //   side: THREE.DoubleSide,
    //   // alpha: true,
    //   // overdraw: true,
    //   color: '#f2fff2',
    // });

    // this.ceilingMaterial = new THREE.ShaderMaterial({
    //   uniforms: this.screenUniforms,
    //   vertexShader,
    //   fragmentShader: ceilingFragmentShader,
    // });

    const dracoLoader = new DRACOLoader();

    this.loader = new GLTFLoader( this.loadingManager );
    this.loader.setDRACOLoader(dracoLoader);
    that.lights = [];

    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
    that.loader = new GLTFLoader( that.loadingManager );
    that.loader.setDRACOLoader(dracoLoader);

    that.loader.load( club, function ( gltf ) {
      gltf.scene.traverse( function ( child ) {
        if ( child.isMesh && child.name.includes( 'DJ_Controller' ) ) {
          child.frustumCulled = false;
        }
        if ( child.name.includes( 'Truss' ) ) {
          child.traverse( ( o ) => {
            // o.material = new THREE.MeshBasicMaterial({color: 'rgb(20,20,20)'});
            // o.castShadow = false;
            // new THREE.MeshBasicMaterial({color: new THREE.Color( 0x040404 )});
            o.material = new THREE.MeshStandardMaterial( {
              color: new THREE.Color( 0x040404 ),
              emissive: new THREE.Color( 0x000000 ),
              // roughness: 0.3,
              // metalness: 1.0,
            });
          });
        }
        // if (child.name.includes( 'WallScreen') || child.name.includes( 'Panel' )) {
        if (child.name.includes( 'WallScreen') ) {
          child.traverse( ( screen ) => {
            console.log( 'xxxx', screen );
            // child.children.map( ( mesh ) => {
              screen.material = that.screenMaterial;
              screen.castShadow = false;
              // child.castShadow = false;
              screen.material.needsUpdate = true;
              // child.material.map.needsUpdate = true;
            // });
          } );
        }

        // if ( child.name.includes( 'Poduim' ) ) {
          // child.traverse( ( screen ) => {
            // child.material = that.colorMaterial;
            // child.material.opacity = 0.1;
            // child.material.needsUpdate = true;
          // } );
        // }

      // if ( child.name.includes( 'Panel' ) ) {
      //   child.traverse( ( obj ) => {
      //     child.material = that.colorMaterial;
      //   });
      // }

        // else if ( child.name.includes( 'Light' ) ) {
        //   child.traverse( ( light ) => {
        //     if ( light instanceof THREE.Light ) {
        //       // that.lights.push( light );
        //       light.intensity = 0.8;
        //       light.visible = false;
        //       light.castShadow = false;
        //     }
        //   });
        // }
        // if (child.name.includes( 'Panel')) {
        //   child.children.map( ( mesh ) => {
        //     mesh.material = that.ceilingMaterial;
        //     mesh.castShadow = false;
        //   });
        // }
      } );

      gltf.scene.position.set( -6.25, 0, 0);
      that.scene.add( gltf.scene );

      // roughnessMipmapper.dispose();

      // that.render();

    } );

        // texture.mapping = THREE.EquirectangularReflectionMapping;

        // that.scene.background = texture;
        // that.scene.environment = texture;

        // that.render();

        // model

        // use of RoughnessMipmapper is optional
        // const roughnessMipmapper = new RoughnessMipmapper( that.renderer );


    // this.loader.load(
    //   // resource URL
    //   club,
    //   // called when the resource is loaded
    //   function ( gltf ) {

    //     console.log( gltf.scene );

    //     gltf.scene.children.map( ( child ) => {
    //       console.log( child.name );
    //       if ( ! child.name.includes('DJBooth') && ! child.name.includes( 'Poduim' ) && ! child.name.includes( 'Cube' ) && ! child.name.includes( 'Light' ) ) {
    //         child.traverse( ( o ) => {
    //           // o.material = new THREE.MeshBasicMaterial({color: 'rgb(20,20,20)'});
    //           o.castShadow = false;
    //         });
    //       }
    //       if ( child.name.includes( 'Truss' ) ) {
    //         child.traverse( ( o ) => {
    //           // o.material = new THREE.MeshBasicMaterial({color: 'rgb(20,20,20)'});
    //           // o.castShadow = false;
    //           o.material = new THREE.MeshBasicMaterial( {
    //             color: new THREE.Color( 0x222222 ),
    //             // emissive: new THREE.Color( 0x000000 ),
    //             // roughness: 0.3,
    //             // metalness: 1.0,
    //           });
    //         });
    //       } else if ( child.name.includes( 'WallScreen' ) || child.name.includes( 'Panel' )) {
    //         child.children.map( ( mesh ) => {
    //           mesh.material = that.screenMaterial;
    //           mesh.castShadow = false;
    //         });
    //       } else if ( child.name.includes( 'Light' ) ) {
    //         child.traverse( ( light ) => {
    //           if ( light instanceof THREE.Light ) {
    //             that.lights.push( light );
    //             light.intensity = 0.8;
    //             light.visible = false;
    //             light.castShadow = false;
    //           }
    //         });
    //       }
    //     });
    //     // gltf.scene.rotateY( Math.PI );
    //     gltf.scene.position.set( -5.5, 0, 0);
    //     // that.addGUI();
    //     that.scene.add( gltf.scene );

    //     // gltf.animations; // Array<THREE.AnimationClip>
    //     // gltf.scene; // THREE.Group
    //     // gltf.scenes; // Array<THREE.Group>
    //     // gltf.cameras; // Array<THREE.Camera>
    //     // gltf.asset; // Object

    //   },
    //   // called while loading is progressing
    //   function ( xhr ) {
    //     // console.log( xhr );
    //     // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    //   },
    //   // called when loading has errors
    //   function ( error ) {
    //     console.log( 'An error happened', error );
    //   }
    // );
  }

  addLights() {
    const color = new THREE.Color( 0x7777FF );
    const intensity = 0.1;

    const l1color = 0x662266;
    const l2color = 0xff22ff;
    const l3color = 0xccccff;

    this.amblight = new THREE.AmbientLight( 0xffffff, this.guiParams.ambLight.intensity );
    this.scene.add( this.amblight );

    this.dirLight1 = new THREE.DirectionalLight( this.guiParams.dirLight1.color, this.guiParams.dirLight1.intensity );
    this.dirLight1.position.set( this.guiParams.dirLight1.position.x, this.guiParams.dirLight1.position.y, this.guiParams.dirLight1.position.z );
    this.dirLight1.target.position.set( this.guiParams.dirLight1.target.position.x, this.guiParams.dirLight1.target.position.y, this.guiParams.dirLight1.target.position.z );
    // this.scene.add( this.dirLight1 );
    // this.scene.add( this.dirLight1.target );

    this.dirLight2 = new THREE.DirectionalLight( this.guiParams.dirLight2.color, this.guiParams.dirLight2.intensity );
    this.dirLight2.position.set( this.guiParams.dirLight2.position.x, this.guiParams.dirLight2.position.y, this.guiParams.dirLight2.position.z );
    this.dirLight2.target.position.set( this.guiParams.dirLight2.target.position.x, this.guiParams.dirLight2.target.position.y, this.guiParams.dirLight2.target.position.z );
    // this.scene.add( this.dirLight2 );
    // this.scene.add( this.dirLight2.target );

    this.spotLight1 = new THREE.SpotLight( 0xffffff, 1 );
    this.spotLight1.position.set( this.guiParams.spotLight1.position.x, this.guiParams.spotLight1.position.y, this.guiParams.spotLight1.position.z );
    this.spotLight1.angle = Math.PI / 4;
    this.spotLight1.penumbra = 0.5;
    this.spotLight1.decay = 2;
    this.spotLight1.distance = 200;

    this.spotLight1.castShadow = false;
    this.scene.add( this.spotLight1 );

    // this.lightHelper = new THREE.SpotLightHelper( this.spotLight1 );
    // this.scene.add( this.lightHelper );

    this.spotLight1.target.position.set( this.guiParams.spotLight1.target.position.x, this.guiParams.spotLight1.target.position.y, this.guiParams.spotLight1.target.position.z );
    this.scene.add( this.spotLight1.target );

    // this.spotLight1 = new THREE.DirectionalLight( this.guiParams.spotLight1.color, this.guiParams.spotLight1.intensity );
    // this.spotLight1.position.set( this.guiParams.spotLight1.position.x, this.guiParams.spotLight1.position.y, this.guiParams.spotLight1.position.z );
    // this.spotLight1.target.position.set( this.guiParams.spotLight1.target.position.x, this.guiParams.spotLight1.target.position.y, this.guiParams.spotLight1.target.position.z );
    // this.scene.add( this.spotLight1 );
    // this.scene.add( this.spotLight1.target );

        // this.dirLight1.position.set( this.guiParams.dirLight1.position.x, this.guiParams.dirLight1.position.y, this.guiParams.dirLight1.position.z );
        // this.dirLight1.target.position.set( this.guiParams.dirLight1.position.x, this.guiParams.dirLight1.position.y, this.guiParams.dirLight1.position.z );
    // this.scene.add( new THREE.DirectionalLightHelper( this.dirLight1, 5 ) );

    // this.light1pos = new THREE.Vector3( 0, 2, 0 );
    // this.light2pos = new THREE.Vector3( -3, 2, -3 );

    // this.pointLight1 = new THREE.PointLight( l1color );
    // this.pointLight1.castShadow = false;
    // this.scene.add( this.pointLight1 );

    // const pointLightHelper1 = new THREE.PointLightHelper( this.pointLight1, 1 );
    // this.scene.add( pointLightHelper1 );

    // this.pointLight2 = new THREE.PointLight( l2color );
    // this.pointLight2.castShadow = true;
    // this.scene.add( this.pointLight2 );

    // const pointLightHelper2 = new THREE.PointLightHelper( this.pointLight2, 1 );
    // this.scene.add( pointLightHelper2 );

    // this.pointLight3 = new THREE.PointLight( l3color );
    // this.pointLight3.castShadow = true;
    // this.pointLight3.position.copy( new THREE.Vector3( 0, 3, -15 ) );
    // this.scene.add( this.pointLight3 );

    // const lightCurve = [];
    // lightCurve.push( new THREE.Vector3(5,0,0) );
    // lightCurve.push( new THREE.Vector3(0,0,5) );
    // lightCurve.push( new THREE.Vector3(-5,0,0) );
    // lightCurve.push( new THREE.Vector3(0,0,-5) );

    // this.curve = new THREE.CatmullRomCurve3( lightCurve );
    // this.curve.closed = true;

    // const l1geom = new THREE.ConeGeometry( 0.5, 2, 3 );
    // const l1mat = new THREE.MeshBasicMaterial( { color: l1color } );
    // l1mat.wireframe = true;
    // this.l1sphere = new THREE.Mesh( l1geom, l1mat );
    // this.scene.add( this.l1sphere );

    // let l2geom = new THREE.ConeGeometry( 0.5, 2, 3 );
    // const l2mat = new THREE.MeshBasicMaterial( { color: l2color } );
    // l2mat.wireframe = true;
    // this.l2sphere = new THREE.Mesh( l2geom, l2mat );
    // this.scene.add( this.l2sphere );
  }

  addObjects() {

    const camCurve = [];
    camCurve.push( this.initialCameraPosition );
    camCurve.push( new THREE.Vector3(0,6,17) );
    camCurve.push( new THREE.Vector3(0,6,7) );
    camCurve.push( new THREE.Vector3(6,6,-8) );
    camCurve.push( new THREE.Vector3(4,6,-20) );
    camCurve.push( new THREE.Vector3(0,5,-25) );
    camCurve.push( new THREE.Vector3(0,5,-23) );

    this.camCurve = new THREE.CatmullRomCurve3( camCurve ); 

    // const points = this.camCurve.getPoints( 50 );
    // const geometry = new THREE.BufferGeometry().setFromPoints( points );
    // const material = new THREE.LineBasicMaterial( { color : 0xff33cc } );
    // const splineObject = new THREE.Line( geometry, material );
    // this.scene.add( splineObject );

    // const positionToLookAt = new THREE.Vector3(-10, 2, 20);
    // this.camStartQuat = this.camera.quaternion.clone(); //set initial angle
    // this.camera.lookAt(positionToLookAt);
    // this.camEndQuat = this.camera.quaternion.clone(); //set destination angle
    // this.camera.quaternion.copy(this.camStartQuat);
  }

  addText() {
    const textGeo = new THREE.PlaneGeometry(300,300);
    const texloader = new THREE.TextureLoader();
    const textTexture = texloader.load( pot );
    const textMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff, opacity: 1, map: textTexture, transparent: true, blending: THREE.AdditiveBlending});
    const text = new THREE.Mesh(textGeo,textMaterial);
    text.position.z = -4;
    text.position.y = 4;
    text.scale.x = 0.01;
    text.scale.y = 0.01;
    text.scale.z = 0.01;
    // this.scene.add( text );
  }

  addComposer() {
    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( new RenderPass( this.scene, this.camera ) );

    // this.glitchPass = new ShaderPass( ShiftShader );
    // this.glitchPass = new TDVRGlitchPass();
    // this.composer.addPass( this.glitchPass );

    // const filmPass = new FilmPass(
    //   0.95,   // noise intensity
    //   0.325,  // scanline intensity
    //   348,    // scanline count
    //   false,  // grayscale
    // );
    // filmPass.renderToScreen = true;
    // this.composer.addPass(filmPass);

    this.followMouseShader = {
      uniforms: {
        u_time: { value: 0.0 },
        tDiffuse: { value: null },
        u_mouse: { value: new THREE.Vector2(0,0) },
        u_resolution: { value: new THREE.Vector2( this.width, this.height ) },
        mWidth: { value: 400.0 },
        mHeight: { value: 400.0 },
        smoothness: { value: 0.1 },
        newCol: { value: new THREE.Vector3(0.81,0.84,1.0) }
      },
      vertexShader,
      fragmentShader: followMouseShader,
    };
    this.followMousePass = new ShaderPass( this.followMouseShader );
    this.composer.addPass( this.followMousePass );

    this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    this.bloomPass.threshold = this.guiParams.bloomThreshold;
    this.bloomPass.strength = this.guiParams.bloomStrength;
    this.bloomPass.radius = this.guiParams.bloomRadius;
    this.composer.addPass( this.bloomPass );


    this.clonexPass = new ShaderPass( CloneXShader );
    this.composer.addPass( this.clonexPass );
  }

  onMouseEnter( e ) {
    this.isOverFogEl = true;
    this.fogEl = e.target;
  }

  onMouseLeave() {
    this.isOverFogEl = false;
    this.fogEl = null;
  }

  updateScrollContainer() {
    if ( this.horizontalContainer ) {
      const containerTop = this.horizontalContainer.getBoundingClientRect().top;
      console.log( containerTop );
      if ( containerTop === 0 ) {
        if ( this.hciScroll === null ) {
          this.hciScroll = window.scrollY;
        }
        const newScroll = this.hciScroll - window.scrollY;
        this.horizontalContainer.style.transform = `translate3d(${ newScroll }px, 0, 0 )`;
      }
    }
  }

  onMouseMove( e ) {
    this.oldMouse = this.mouse;
    this.mouse = new THREE.Vector2( e.clientX / this.width , ( this.height - e.clientY ) / this.height );
    this.oldMouseSpeed = this.mouseSpeed;
    this.mouseSpeed = new THREE.Vector2( Math.abs(Math.min((this.mouse.x - this.oldMouse.x) * 10, 1)), Math.abs(Math.min((this.mouse.y - this.oldMouse.y) * 10), 1));
    this.mouseAcc = new THREE.Vector2( (this.mouse.x - e.clientX) - this.mouseSpeed.x , (this.mouse.y - this.height + e.clientY) - this.mouseSpeed.y );

    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if ( this.isOverFogEl && this.fogEl ) {
      this.mouseWX = this.fogEl.clientWidth * 0.4;
      this.mouseWY = this.fogEl.clientHeight * 0.6;
      this.smoothness = 0.2;
      this.lerp = 0.05;
    } else {
      this.mouseWX = 1;
      this.mouseWY = 1;
      this.smoothness = 0.001;
      this.lerp = 0.05;
    }
  }

  updateMouse() {
    this.lMouse.x -= ( this.lMouse.x - this.mouse.x ) * 0.1;
    this.lMouse.y -= ( this.lMouse.y - this.mouse.y ) * 0.1;

    this.mouseTargetX -= ( this.mouseTargetX - this.mouseX ) * this.lerp;
    this.mouseTargetY -= ( this.mouseTargetY - this.mouseY ) * this.lerp;

    this.mouseTargetWX -= ( this.mouseTargetWX - this.mouseWX ) * this.lerp;
    this.mouseTargetWY -= ( this.mouseTargetWY - this.mouseWY ) * this.lerp;

    this.smoothnessTarget -= ( this.smoothnessTarget - this.smoothness ) * this.lerp / 2.;

    this.scrollTarget -= ( this.scrollTarget - this.lastScrollPos ) * this.lerp;

    this.followMousePass.uniforms.u_mouse.value = this.lMouse;
    this.followMousePass.uniforms.mWidth.value = this.mouseTargetWX;
    this.followMousePass.uniforms.mHeight.value = this.mouseTargetWY;
    this.followMousePass.uniforms.smoothness.value = this.smoothnessTarget;
  }

  render() {
    this.time += 0.05;
    this.controls.update();

    this.updateMouse();
    this.updateScrollContainer();

    //update shaders
    this.clonexPass.uniforms.dattime.value += .012,
    this.clonexPass.uniforms.dattime.value > 6.5 && (this.clonexPass.uniforms.dattime.value = -1);

    if ( this.analyser && this.dirLight1 ) {
      this.analyser.getFrequencyData();
      this.dirLight1.intensity = Math.pow(this.analyser.data[1] / 255., 7);
      this.dirLight2.intensity = Math.pow(this.analyser.data[1] / 310., 7);
      this.spotLight1.intensity = 5. - Math.pow(this.analyser.data[ this.guiParams.analyserIndex ] / 10000 * this.guiParams.analyserIntensity, 10);

      this.colorMaterial.color.b = 5. - Math.pow(this.analyser.data[ this.guiParams.analyserIndex ] / 10000 * this.guiParams.analyserIntensity, 1);
      this.colorMaterial.color.r = 2. - Math.pow(this.analyser.data[ this.guiParams.analyserIndex ] / 10000 * this.guiParams.analyserIntensity, 1);
      this.colorMaterial.color.g = 0.2;

      this.colorMaterial.needsUpdate = true;
      this.screenUniforms.u_time.value = this.time * 0.025;
      this.screenUniforms.tAudioData.value.needsUpdate = true;
    }

    this.followMousePass.uniforms.u_time.value = this.time * 0.025;

    let point = this.scrollPercentage;
    if ( point < 0 ) {
      point = 0;
    } else if ( point > 1 ) {
      point = 1;
    }

    try {
      this.camCurve.getPoint( point, this.camPos );
    } catch( e ) {
      
    }

    this.camera.lookAt( this.pultPos );

    Object.assign( this.camPos, {
      x: this.camPos.x - Math.sin( .5 * Math.PI * ( this.mouse.x - .5 ) ),
      y: this.camPos.y + Math.sin( .25 * Math.PI * ( this.mouse.y - .5 ) ),
      z: this.camPos.z - Math.cos( .5 * Math.PI * ( this.mouse.x - .5 ) ),
    });

    this.camera.position.set( ...this.camPos );

    this.scroll -=(this.scroll - this.scrollTarget) * 0.005;
    this.scroll *= 0.9;

    // this.lightHelper.update();

    // this.stats.begin();
    if ( this.guiParams.is3d ) {
      this.composer.render( this.scene, this.camera );
    }
    // this.stats.end();
    window.requestAnimationFrame( this.render.bind( this ) );


  }
}