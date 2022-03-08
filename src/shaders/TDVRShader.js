/**
 * Full-screen textured quad shader
 */

import fragmentShader from './tdvr.glsl';

var TDVRShader = {

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
    'amount': { type: 'f', value: 0.0 },
    'angle': { type: 'f', value: 0.0 },
		'dattime': { type: 'f', value: 0.0 },
		'strength': { type: 'f', value: 0.4 },
		'radius': { type: 'f', value: .15 },
		'power': { type: 'f', value: 1 },
		'threshold': { type: 'f', value: .05 },
		'smoothWidth': { type: 'f', value: .31 },
		'gamma': { type: 'f', value: 1 },
		'vignfalloff': { type: 'f', value: 0.2 },
		'vignamount': { type: 'f', value: 0.4 },
		postcolor: { value: true },
		postfilm: { value: true },
		tInput: {
			value: null,
		}
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		varying vec2 vUv2;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader,

};

export { TDVRShader };