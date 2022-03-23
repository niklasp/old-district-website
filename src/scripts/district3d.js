import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

import GUI from 'lil-gui';

import { monitorScroll, monitorWheel, ColorGUIHelper } from './util';
import screenFragmentShader from '../shaders/screenFragmentShader.glsl';
import floorFragmentShader from '../shaders/floorFragmentShader.glsl';
import followMouseShader from '../shaders/followMouseShader.glsl';

import vertexShader from '../shaders/vertexShader.glsl';
import { TDVRShader } from '../shaders/TDVRShader.js';

import club from '../models/club/reduce.glb';
import pot from '../../public/POT.png';

import visuals from '../images/tdvr_teaser_for_web_1_sm.mp4';
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
    this.screens = [];

    this.appParams = {
      state: 'start', //playing //paused //no3d
      exposure: 1.1,
      bloomStrength: 0.234,
      bloomThreshold: 0.3,
      bloomRadius: 0.22,
      audioLoaded: false,
      audioPlaying: false,
      isAppleDevice: /(iPad|iPhone|iPod)/g.test( navigator.userAgent ),
      ambLight: {
        color: '#5e68b0',
        intensity: 2.0,
      },
      analyserIndex: 27,
      analyserIntensity: 241,
      dirLight1: {
        color: '#181d5d',
        intensity: 1.0,
        position: {
          x: 0,
          y: -15.12,
          z: 20.96,
        },
        target: {
          position: {
            x: 0,
            y: -7.8,
            z: -20.0,
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
        intensity: 3.0,
        distance: 76,
        penumbra: 0.8,
        angle: 0.77,
        position: {
          x: 0,
          y: 7.6515,
          z: -19.851,
        },
        target: {
          position: {
            x: 0,
            y: 4.0940,
            z: -20.60,
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
    this.pultPos = new THREE.Vector3( 0, 4.8, -22 );

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
    this.faderContainer = document.querySelector( '.fader' );
    this.faderScroll = null;
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

    const fov = 40;
    const near = 0.01;
    const far = 70;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    this.initialCameraPosition = new THREE.Vector3( 0, 7, 26 );
    this.initialCameraTarget = new THREE.Vector3( 0, 8, 0 );

    let pixelRatio = window.devicePixelRatio;
    let AA = true;
    if (pixelRatio > 1) {
      AA = false;
    }

    this.renderer = new THREE.WebGLRenderer( {
      antialias: AA,
      autoClear: true,
      powerPreference: "high-performance",
    } );

    this.renderer.setSize( this.width, this.height );

    this.container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.object.position.set( ...this.initialCameraPosition );
    this.controls.target = new THREE.Vector3(0,4,-30);
    this.controls.update();

    this.setupLoading();
    this.setupListeners();
    this.loadModels();
    this.addLights();
    // this.addGUI();
    // this.addObjects();
    this.addComposer();
    this.render();
    this.resize();
  }

  setState( newState ) {
    this.onChageState( newState );
    this.appParams.state = newState;
  }

  onChageState( newState ) {
    switch ( newState ) {
      case 'start':
        break;
      case 'playing':
        playbutton.classList.toggle( 'out' );
        document.body.style.position = 'inherit';

        if ( ! this.appParams.audioLoaded ) {
          this.loadAudio();
          this.appParams.audioLoaded = true;

          window.scrollTo({
            top: this.height,
            behavior: 'smooth'
          });
        }

        this.screenMaterial = new THREE.ShaderMaterial({
          uniforms: this.screenUniforms,
          vertexShader,
          fragmentShader: screenFragmentShader,
        });

        this.screens.forEach( screen => {
          screen.material = this.screenMaterial;
          screen.material.needsUpdate = true;
        });

        [ ...document.querySelectorAll( '.f-in') ].forEach( el => {
          el.style.opacity = 1;
        });

        new TWEEN.Tween(this.amblight)
            .to( {
              intensity: 1.8
            }, 1000 )
            .start();

        playbutton.classList.toggle( 'paused' );

        break;
      case 'paused':
        playbutton.classList.toggle( 'paused' );
        break;
      case 'no3d':
        break;
    }
  }

  addGUI() {
    this.gui = new GUI();
    const that = this;
    const bloomFolder = this.gui.addFolder( 'Bloom' ).close();

    bloomFolder.add( this.appParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {
      that.renderer.toneMappingExposure = Math.pow( value, 4.0 );
    } );

    bloomFolder.add( this.appParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
      that.bloomPass.threshold = Number( value );
    } );

    bloomFolder.add( this.appParams, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
      that.bloomPass.strength = Number( value );
    } );

    bloomFolder.add( this.appParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
      that.bloomPass.radius = Number( value );
    } );

    const lightsFolder = this.gui.addFolder( 'Lights' ).close();
    lightsFolder.add( this.appParams.ambLight, `intensity`, 0.0, 10.0 ).name('ambientintensity').onChange( function ( value ) {
      that.amblight.intensity = value;
    } );
    lightsFolder.addColor( new ColorGUIHelper( this.amblight, 'color'), 'value' ).name( 'Ambient Color');

    const fd1 = lightsFolder.addFolder( 'Directional Light 1' ).close();
    fd1.addColor( new ColorGUIHelper( this.dirLight1, 'color'), 'value' ).name( 'Color');
    fd1.add( this.appParams.dirLight1, 'intensity', 0, 1).onChange( value => this.dirLight1.intensity = value );
    // fd1.add( this.appParams.dirLight1.position, 'x', -20, 20).name( 'd1x' ).onChange( value => this.dirLight1.position.setX( value ) );
    fd1.add( this.appParams.dirLight1.position, 'y', -40, 40).name( 'y' ).onChange( value => this.dirLight1.position.setY( value ) );
    fd1.add( this.appParams.dirLight1.position, 'z', -40, 40).name( 'z' ).onChange( value => this.dirLight1.position.setZ( value ) );
    // fd1.add( this.appParams.dirLight1.target.position, 'x', -20, 20).name( 'd1tx' ).onChange( value => this.dirLight1.target.position.setX( value ) );
    fd1.add( this.appParams.dirLight1.target.position, 'y', -40, 40).name( 'target y' ).onChange( value => this.dirLight1.target.position.setY( value ) );
    fd1.add( this.appParams.dirLight1.target.position, 'z', -40, 40).name( 'target z' ).onChange( value => this.dirLight1.target.position.setZ( value ) );

    const fd2 = lightsFolder.addFolder( 'Directional Light 2' ).close();
    fd2.addColor( new ColorGUIHelper( this.dirLight2, 'color'), 'value' ).name( 'Dir Light 2');
    fd2.add( this.appParams.dirLight2, 'intensity', 0, 1).onChange( value => this.dirLight2.intensity = value );
    fd2.add( this.appParams.dirLight2.position, 'x', -20, 20).name( 'x' ).onChange( value => this.dirLight2.position.setX( value ) );
    fd2.add( this.appParams.dirLight2.position, 'y', -20, 20).name( 'y' ).onChange( value => this.dirLight2.position.setY( value ) );
    fd2.add( this.appParams.dirLight2.position, 'z', -20, 20).name( 'z' ).onChange( value => this.dirLight2.position.setZ( value ) );
    fd2.add( this.appParams.dirLight2.target.position, 'x', -20, 20).name( 'target x' ).onChange( value => this.dirLight2.target.position.setX( value ) );
    fd2.add( this.appParams.dirLight2.target.position, 'y', -20, 20).name( 'target y' ).onChange( value => this.dirLight2.target.position.setY( value ) );
    fd2.add( this.appParams.dirLight2.target.position, 'z', -20, 20).name( 'target z' ).onChange( value => this.dirLight2.target.position.setZ( value ) );

    const fd3 = lightsFolder.addFolder( 'Spot Light' ).close();
    fd3.addColor( new ColorGUIHelper( this.spotLight1, 'color'), 'value' ).name( 'Spot Light');
    fd3.add( this.appParams.spotLight1, 'intensity', 0, 3).onChange( value => this.spotLight1.intensity = value );
    fd3.add( this.appParams.spotLight1, 'distance', 0, 100).onChange( value => this.spotLight1.distance = value );
    fd3.add( this.appParams.spotLight1, 'penumbra', 0, 1).onChange( value => this.spotLight1.penumbra = value );
    fd3.add( this.appParams.spotLight1, 'angle', 0, Math.PI * 2).onChange( value => this.spotLight1.angle = value );
    fd3.add( this.appParams.spotLight1.position, 'x', -25, 20).name( 'x' ).onChange( value => this.spotLight1.position.setX( value ) );
    fd3.add( this.appParams.spotLight1.position, 'y', -25, 20).name( 'y' ).onChange( value => this.spotLight1.position.setY( value ) );
    fd3.add( this.appParams.spotLight1.position, 'z', -25, 20).name( 'z' ).onChange( value => this.spotLight1.position.setZ( value ) );
    fd3.add( this.appParams.spotLight1.target.position, 'x', -25, 20).name( 'target x' ).onChange( value => this.spotLight1.target.position.setX( value ) );
    fd3.add( this.appParams.spotLight1.target.position, 'y', -25, 20).name( 'target y' ).onChange( value => this.spotLight1.target.position.setY( value ) );
    fd3.add( this.appParams.spotLight1.target.position, 'z', -25, 20).name( 'target z' ).onChange( value => this.spotLight1.target.position.setZ( value ) );
    fd3.add( this.appParams, 'analyserIndex', 0, 254).step( 1 ).name( 'beat index' ).onChange( value => this.appParams.analyserIndex = value );
    fd3.add( this.appParams, 'analyserIntensity', 0, 1000).step( 1 ).name( 'beat intensity' ).onChange( value => this.appParams.analyserIntensity = value );

    const videoFolder = this.gui.addFolder( 'Video' ).close();
    videoFolder.add( this.appParams, 'is3d' ).onChange( val => {
      if ( val ) {
        this.container.style.display = 'block';
      } else {
        this.container.style.display = 'none';
      }
    });
    videoFolder.add( this.appParams, 'videox' ).onChange( val => {
      this.screenUniforms.videox.value = val;
    });
    videoFolder.add( this.appParams, 'globalvideo' ).onChange( val => {
      this.screenUniforms.globalvideo.value = val;
    });

    const postFolder = this.gui.addFolder( 'Postprocessing' ).close();
    postFolder.add( this.appParams, 'postcolor' ).name( 'Colorstorm' ).onChange( value => {
      this.tdvrPass.uniforms.postcolor.value = value;
    });
    postFolder.add( this.appParams, 'postfilm' ).name( 'Film' ).onChange( value => {
      this.tdvrPass.uniforms.postfilm.value = value;
    });

    const fxFolder = this.gui.addFolder( 'fx' );
    fxFolder.addColor( this.appParams.fx, 'smokeCol' ).name( 'Smoke Color' ).onChange( value => {
      this.followMousePass.uniforms.newCol.value = value;
    });

    this.gui.close();
  }

  setupLoading() {
    const that = this;
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    this.loadingManager.onLoad = function ( ) {
      if ( typeof that.loadingDiv !== 'undefined' ) {
        that.loadingDiv.classList.add( 'hidden' );
      }


      if ( document.body.classList.contains( 'newsroom') ) {
        document.body.style.position = 'inherit';
      }
    };

    this.loadingManager.onError = function ( url ) {
      console.log( 'There was an error loading ' + url );
      this.appParams.is3d = false;
    };
  }

  setupListeners() {
    document.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
    window.addEventListener( 'resize', this.resize.bind( this ) );

    [ ...document.querySelectorAll( '.has-fog' ) ].map( ( el ) => {
      el.addEventListener( 'mouseenter', this.onMouseEnter.bind( this ) );
      el.addEventListener( 'mouseleave', this.onMouseLeave.bind( this ) );
    });

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
        if ( this.appParams.state !== 'playing' ) {
          this.setState( 'playing' );
        } else {
          this.setState( 'paused' );
        }

        if ( ! this.appParams.audioPlaying ) {
          that.appParams.audioPlaying = true;

          if ( this.appParams.isAppleDevice ) {
            that.audio?.play();
          } else {
            that.mediaElement?.play();
          }

          var volume = { x : 0 };
          new TWEEN.Tween(volume).to({
              x: 0.2
          }, 5000).onUpdate(function( val ) {
             that.audio.setVolume( val.x );
          }).start();

        } else {
          that.audio?.pause();
          that.mediaElement?.pause();
          that.appParams.audioPlaying = false;
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
    if ( this.screenUniforms ) {
      this.screenUniforms.u_resolution.value = new THREE.Vector2( this.width, this.height );
    }
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
        that.audio.setVolume( 0.0 );
        that.audio.play();
      } );
    } else {
      this.mediaElement = document.getElementById( 'beat' );
      this.mediaElement.loop = true;
      this.audio.setMediaElementSource( this.mediaElement );
      this.audio.setVolume( 0.0 );
    }

    this.analyser = new THREE.AudioAnalyser( this.audio, this.fftSize );
    this.analyser.analyser.smoothingTimeConstant = 0.90;
    this.audioFormat = THREE.LuminanceFormat;
    this.screenUniforms.tAudioData = { value: new THREE.DataTexture( this.analyser.data, this.fftSize / 2, 1, this.audioFormat ) };
  }

  loadModels() {
    const that = this;

    this.video = document.getElementById( 'bgvid' );
    this.video.src = visuals;
    this.video.load();
    this.vTexture = new THREE.VideoTexture( this.video );
    // this.vTexture.minFilter = THREE.LinearFilter;
    // this.vTexture.magFilter = THREE.LinearFilter;
    this.vTexture.format = THREE.RGBAFormat;

    this.screenUniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2( this.width, this.height ) },
      u_mouse: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
      u_video: { value: this.vTexture },
      tAudioData: { value: new THREE.DataTexture() },
      videox: { value: true },
      globalvideo: { value: true },
      postfilm: { value: true },
      postglitch: { value: false },
      postcolor: { value: true },
    },

    this.screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x999999,
    });

    this.floorMaterial = new THREE.ShaderMaterial({
      uniforms: this.screenUniforms,
      vertexShader,
      fragmentShader: floorFragmentShader,
      transparent: true,
    });

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
        // make dj controller always visible
        if ( child.isMesh && child.name.includes( 'DJ_Controller' ) ) {
          child.frustumCulled = false;
        }
        if ( child.name.includes( 'HandRef') ) {
          child.visible = false;
        }
        if ( child.name.includes( 'Truss' ) ) {
          child.traverse( ( o ) => {
            o.material = new THREE.MeshStandardMaterial( {
              color: new THREE.Color( 0x040404 ),
              emissive: new THREE.Color( 0x000000 ),
            });
          });
        }
        // add screenmaterial
        if (child.name.includes( 'WallScreen') || child.name.includes( 'Panel' ) ) {
          child.traverse( ( screen ) => {
              screen.material = that.screenMaterial;
              screen.castShadow = false;
              screen.material.needsUpdate = true;
            that.screens.push( screen );
          } );

        }
      } );

      gltf.scene.position.set( -6.25, 0, 0);
      that.scene.add( gltf.scene );
    } );
  }

  addLights() {
    const color = new THREE.Color( 0x7777FF );
    const intensity = 0.1;

    const l1color = 0x662266;
    const l2color = 0xff22ff;
    const l3color = 0xccccff;

    this.amblight = new THREE.AmbientLight( this.appParams.ambLight.color, this.appParams.ambLight.intensity );
    this.scene.add( this.amblight );

    this.dirLight1 = new THREE.DirectionalLight( this.appParams.dirLight1.color, this.appParams.dirLight1.intensity );
    this.dirLight1.position.set( this.appParams.dirLight1.position.x, this.appParams.dirLight1.position.y, this.appParams.dirLight1.position.z );
    this.dirLight1.target.position.set( this.appParams.dirLight1.target.position.x, this.appParams.dirLight1.target.position.y, this.appParams.dirLight1.target.position.z );
    this.scene.add( this.dirLight1 );
    this.scene.add( this.dirLight1.target );

    // this.lightHelper2 = new THREE.DirectionalLightHelper( this.dirLight1 );
    // this.scene.add( this.lightHelper2 );

    this.dirLight2 = new THREE.DirectionalLight( this.appParams.dirLight2.color, this.appParams.dirLight2.intensity );
    this.dirLight2.position.set( this.appParams.dirLight2.position.x, this.appParams.dirLight2.position.y, this.appParams.dirLight2.position.z );
    this.dirLight2.target.position.set( this.appParams.dirLight2.target.position.x, this.appParams.dirLight2.target.position.y, this.appParams.dirLight2.target.position.z );
    // this.scene.add( this.dirLight2 );
    // this.scene.add( this.dirLight2.target );page

    this.spotLight1 = new THREE.SpotLight( 0xffffff, 1 );
    this.spotLight1.position.set( this.appParams.spotLight1.position.x, this.appParams.spotLight1.position.y, this.appParams.spotLight1.position.z );
    this.spotLight1.angle = this.appParams.spotLight1.angle;
    this.spotLight1.intensity = this.appParams.spotLight1.intensity;
    this.spotLight1.penumbra = this.appParams.spotLight1.penumbra;
    this.spotLight1.decay = 1.0;
    this.spotLight1.distance = this.appParams.spotLight1.distance;

    this.spotLight1.castShadow = false;
    this.scene.add( this.spotLight1 );

    // this.lightHelper1 = new THREE.SpotLightHelper( this.spotLight1 );
    // this.scene.add( this.lightHelper1 );

    this.spotLight1.target.position.set( this.appParams.spotLight1.target.position.x, this.appParams.spotLight1.target.position.y, this.appParams.spotLight1.target.position.z );
    this.scene.add( this.spotLight1.target );
  }

  addObjects() {

    const camCurve = [];
    camCurve.push( this.initialCameraPosition );
    camCurve.push( new THREE.Vector3(0,6,17) );
    camCurve.push( new THREE.Vector3(0,6,7) );
    camCurve.push( new THREE.Vector3(6,6,-8) );
    camCurve.push( new THREE.Vector3(4,6,-20) );
    camCurve.push( new THREE.Vector3(0,5,-25) );
    camCurve.push( new THREE.Vector3(0,5.5,-22) );

    this.camCurve = new THREE.CatmullRomCurve3( camCurve ); 
  }

  addComposer() {
    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( new RenderPass( this.scene, this.camera ) );

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
    this.bloomPass.threshold = this.appParams.bloomThreshold;
    this.bloomPass.strength = this.appParams.bloomStrength;
    this.bloomPass.radius = this.appParams.bloomRadius;
    this.composer.addPass( this.bloomPass );


    this.tdvrPass = new ShaderPass( TDVRShader );
    this.composer.addPass( this.tdvrPass );
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
      if ( containerTop === 0 ) {
        if ( this.hciScroll === null ) {
          this.hciScroll = window.scrollY;
        }
        const newScroll = this.hciScroll - window.scrollY;
        this.horizontalContainer.style.transform = `translate3d(${ newScroll }px, 0, 0 )`;
      }
    }

    if ( this.faderContainer ) {
      const cam = this.faderContainer.querySelector('.camera');
      const items = [ ...this.faderContainer.querySelectorAll( '.item' ) ];
      const containerTop = cam.getBoundingClientRect().top;
      if ( containerTop === 0 ) {
        if ( this.faderScroll === null ) {
          this.faderScroll = window.scrollY;
        }
        const newScroll = - ( this.faderScroll - window.scrollY) / ( this.faderContainer.getBoundingClientRect().height - cam.getBoundingClientRect().height ) * 3;

        items.forEach( (item, idx) => {
          const transY = - ( newScroll + 1 - (idx + 1) ) * 200;
          item.style.opacity = 1. - ( Math.pow( newScroll + 1 - (idx + 1), 4)) * 3;
          item.style.transform = `translate3d(-50%, ${transY - 50}%,0)`;
        });
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
      this.mouseWX = this.fogEl.clientWidth * 0.3;
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
    TWEEN.update();

    this.updateMouse();
    this.updateScrollContainer();

    //update shaders
    this.tdvrPass.uniforms.dattime.value += .012,
    this.tdvrPass.uniforms.dattime.value > 6.5 && (this.tdvrPass.uniforms.dattime.value = -1);

    if ( this.analyser && this.dirLight1 ) {
      this.analyser.getFrequencyData();
      this.dirLight1.intensity = Math.pow(this.analyser.data[ this.appParams.analyserIndex ] / 10000 * this.appParams.analyserIntensity, 1);
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

    if ( this.appParams.is3d ) {
      this.composer.render( this.scene, this.camera );
    }

    window.requestAnimationFrame( this.render.bind( this ) );
  }
}