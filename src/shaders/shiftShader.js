/**
 * Full-screen textured quad shader
 */

var ShiftShader = {

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
    'amount': { type: 'f', value: 0.0 },
    'angle': { type: 'f', value: 0.0 }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`
		uniform float opacity;
    uniform float amount;
    uniform float angle;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
			vec2 offset = amount * vec2( cos(angle), sin(angle));
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cga = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
		}`

};

export { ShiftShader };