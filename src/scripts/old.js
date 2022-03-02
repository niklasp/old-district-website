import * as THREE from 'three';
import Wave from '@foobar404/wave';
import {
  filter, 
} from 'lodash';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

import Stats from 'stats.js';

import { monitorScroll, monitorWheel } from './util';
import { ShiftShader } from '../shaders/shiftShader';
import { TDVRGlitchPass } from '../shaders/GlitchPass';

import club from '../models/club/untitled_no_walls.glb';
import djset from '../models/djset/model.glb';
import spiral from '../models/spiral/model.glb';

export default class Sketch {
  constructor( options ) {

    this.loadModels.bind( this );
    this.time = 0;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.direction = 1;
    this.scrollPercentage = 0.0;

    this.loadingDiv = document.getElementById( 'loader' );

    this.container = options.dom;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    console.log( this.width, this.height );

    const fov = 40;
    const near = 0.01;
    const far = 100;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    this.camera.position.x = -5.456995630901276;
    this.camera.position.y = 5.58;
    this.camera.position.z = 26.91;
    this.camera.quaternion.copy( new THREE.Quaternion( -0.0030420754286173495, 0.9917866067418732, 0.024023244932570877, 0.12559043023828312 ) );

    // const gridHelper = new THREE.GridHelper( 100, 100 );
    // this.scene.add( gridHelper );
    // this.scene.overrideMaterial = new THREE.MeshPhongMaterial();

    this.stats = new Stats();
    this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );

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
    this.container.addEventListener('click', ( e ) => {
      console.log(this.camera?.position, this.camera?.quaternion);
    });

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.setupLoading();
    this.setupListeners();
    this.loadModels();
    this.addLights();
    this.addObjects();
    this.addComposer();
    this.render();
    this.resize();
  }

  setupLoading() {
    const that = this;
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    this.loadingManager.onLoad = function ( ) {
      console.log( 'Loading complete!');

      // When the modal is hidden, we want to remain at the top of the scroll position
      document.body.style.position = '';
      document.body.style.top = '';

      if ( typeof that.loadingDiv !== 'undefined' ) {
        that.loadingDiv.style.display = 'none';
      }
    };

    this.loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

      // When the modal is shown, we want a fixed body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;

      that.updateLoader( `${ (itemsLoaded / itemsTotal * 100).toFixed( 0 ) }%` );
    };

    this.loadingManager.onError = function ( url ) {
      console.log( 'There was an error loading ' + url );
    };
  }

  updateLoader( val ) {
    this.loadingDiv.querySelector( 'h2' ).innerHTML = val;
  }

  setupListeners() {
    window.addEventListener( 'resize', this.resize.bind( this ) );

    monitorScroll(
      ratio => {
        this.scrollPercentage = (ratio).toFixed(3);
      }
    );

    monitorWheel(
      ( scrollTarget ) => {
        this.direction = this.scroll > 0 ? -1 : 1;
        this.scrollTarget = scrollTarget;
      }
    );
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.composer?.setSize( this.width, this.height );
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  loadModels() {
    const that = this;

    this.screenMaterial = new THREE.MeshBasicMaterial( { color: new THREE.Color( 0xFFFFFF ) } );

    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
    this.loader = new GLTFLoader( this.loadingManager );
    this.loader.setDRACOLoader(dracoLoader);
    
    this.loader.load(
      // resource URL
      club,
      // called when the resource is loaded
      function ( gltf ) {

        console.log( gltf.scene );

        filter( gltf.scene.children, ( o ) => {
          return o.name.includes('WallScreen');
        }).map( ( group ) => {
          group.children.map( ( mesh ) => {
            mesh.material = that.screenMaterial;
          });
        });

        gltf.scene.children.map( ( child ) => {
          console.log( child.name );
          if ( child.name.includes( 'Truss' ) || child.name.includes( 'Poduim' ) ) {
            child.traverse( ( o ) => {
              o.material = new THREE.MeshStandardMaterial( {
                color: new THREE.Color( 0x999999 ),
                emissive: new THREE.Color( 0x444444 ),
                roughness: 0.2,
                metalness: 0.9,
              });
            });
          }
        });

        // gltf.scene.rotateY( Math.PI );
        // gltf.scene.position.set( -3, -1.1, -5 );

        that.scene.add( gltf.scene );

        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Group
        // gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object

      },
      // called while loading is progressing
      function ( xhr ) {
        // console.log( xhr );
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened', error );
      }
    );
  }

  addLights() {
    const color = new THREE.Color( 0x7777FF );
    const intensity = 0.1;

    const l1color = 0x22ffff;
    const l2color = 0xff22ff;
    const l3color = 0xccccff;

    this.light = new THREE.AmbientLight(color, intensity);
    this.scene.add( this.light );

    this.light1pos = new THREE.Vector3( 0, 2, 0 );
    this.light2pos = new THREE.Vector3( -3, 2, -3 );

    this.pointLight1 = new THREE.PointLight( l1color );
    this.pointLight1.castShadow = true;
    this.scene.add( this.pointLight1 );

    const pointLightHelper1 = new THREE.PointLightHelper( this.pointLight1, 1 );
    this.scene.add( pointLightHelper1 );

    this.pointLight2 = new THREE.PointLight( l2color );
    this.pointLight2.castShadow = true;
    this.scene.add( this.pointLight2 );

    const pointLightHelper2 = new THREE.PointLightHelper( this.pointLight2, 1 );
    this.scene.add( pointLightHelper2 );

    this.pointLight3 = new THREE.PointLight( l3color );
    this.pointLight3.castShadow = true;
    this.pointLight3.position.copy( new THREE.Vector3( 0, 3, -15 ) );
    this.scene.add( this.pointLight3 );

    const lightCurve = [];
    lightCurve.push( new THREE.Vector3(5,0,0) );
    lightCurve.push( new THREE.Vector3(0,0,5) );
    lightCurve.push( new THREE.Vector3(-5,0,0) );
    lightCurve.push( new THREE.Vector3(0,0,-5) );

    this.curve = new THREE.CatmullRomCurve3( lightCurve );
    this.curve.closed = true;

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
    // this.geometry = new THREE.BoxGeometry( 2, 2, 2 );
    // this.material = new THREE.MeshNormalMaterial();

    // this.material = new THREE.ShaderMaterial({
    //   fragmentShader: `
    //     void main() {
    //       gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5);
    //     }
    //   `,
    //   vertexShader: `
    //     void main() {
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //     }
    //   `,
    // });

    // // this.mesh = new THREE.Mesh( this.geometry, this.material );
    // // this.scene.add( this.mesh );

    // const matFloor = new THREE.MeshPhongMaterial();
    // const geoFloor = new THREE.PlaneGeometry( 2000, 2000 );
    // const mshFloor = new THREE.Mesh( geoFloor, matFloor );
		// mshFloor.rotation.x = - Math.PI * 0.5;
    // mshFloor.receiveShadow = true;
    // mshFloor.position.set( 0, - 0.05, 0 );
    // this.scene.add( mshFloor );

    const camCurve = [];
    camCurve.push( new THREE.Vector3(0,3,17) );
    camCurve.push( new THREE.Vector3(0,3,7) );
    camCurve.push( new THREE.Vector3(6,3,-8) );
    camCurve.push( new THREE.Vector3(4,3,-10) );
    camCurve.push( new THREE.Vector3(0,2,-12) );

    this.camCurve = new THREE.CatmullRomCurve3( camCurve ); 

    const points = this.camCurve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color : 0xff33cc } );
    const splineObject = new THREE.Line( geometry, material );
    this.scene.add( splineObject );

    const positionToLookAt = new THREE.Vector3(-1, -5.1, 10);
    // this.camStartQuat = this.camera.quaternion.clone(); //set initial angle

    // this.camEndQuat = this.camera.quaternion.clone(); //set destination angle
    // this.camera.quaternion.copy(this.camStartQuat);
  }

  addComposer() {
    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( new RenderPass( this.scene, this.camera ) );

    // this.glitchPass = new ShaderPass( ShiftShader );
    this.glitchPass = new TDVRGlitchPass();
    this.composer.addPass( this.glitchPass );
  }

  render() {
    this.time += 0.05;
    // console.log( this.camera.position );

    // const camPos = this.camCurve.getPoint( Math.abs( this.scrollPercentage ) );

    // this.pointLight1.position.z = Math.sin( this.time ) * 100;
    // this.pointLight2.position.z = Math.sin( this.time ) * 100;

    // const light1pos = this.curve.getPoint( this.time / 30 );
    // this.pointLight1.position.set( this.light1pos.x + light1pos.x, this.light1pos.y + light1pos.y, this.light1pos.z + light1pos.z );

    // const light2pos = this.curve.getPoint( this.time / 20 );
    // this.pointLight2.position.set( this.light2pos.x + light2pos.x, this.light2pos.y + light2pos.y, this.light2pos.z + light2pos.z );

    // this.l1sphere.position.set(  this.light1pos.x + light1pos.x, this.light1pos.y + light1pos.y, this.light1pos.z + light1pos.z );
    // this.l2sphere.position.set( this.light2pos.x + light2pos.x, this.light2pos.y + light2pos.y, this.light2pos.z + light2pos.z );

    // this.pointLight2.power = (Math.sin( this.time / 4 ) + 1) * 12;

    // this.camera.lookAt( new THREE.Vector3( 1, 1.1, -10 ) );
    // this.camera.position.set( camPos.x, camPos.y, camPos.z );
    // this.camera.quaternion.slerpQuaternions(this.camStartQuat, this.camEndQuat, this.scrollPercentage * this.scrollPercentage );

    // this.scroll -=(this.scroll - this.scrollTarget) * 0.005;
    // this.scroll *= 0.9;
    this.glitchPass.uniforms.amount.value = 0.001;
    // this.glitchPass.uniforms.distortion_x.value = 0.2;
    // this.glitchPass.uniforms.distortion_y.value = 0.2;
    // this.spiralMixer?.update( 0.01 );

    this.stats.begin();
    this.composer.render( this.scene, this.camera );
    this.stats.end();
    window.requestAnimationFrame( this.render.bind( this ) );


  }
}