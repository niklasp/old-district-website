uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load
uniform sampler2D tDiffuse;
uniform float mWidth;
uniform float mHeight;
uniform float smoothness;
uniform vec3 newCol;

varying vec2 vUv;
varying vec3 vNormal;

// float rand( vec2 coord ) {
//   return fract(sin(dot(coord, vec2(56., 78.)) * 1000.0) * 1000.);
// }

// float noise( vec2 coord ) {
//   vec2 i = floor( coord );
//   vec2 f = fract( coord );

//   float a = rand(i);
//   float b = rand(i + vec2(1.0, 0.0));
//   float c = rand(i + vec2(0.0, 1.0));
//   float d = rand(i + vec2(1.0, 1.0));

//   return mix(a, b, f.x ) * ( c -a ) * f.y * (1.0 - f.x ) + (d-b) * f.x * f.y;
// }

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    
	return res*res;
}

float circle(vec2 _st, float _radius){
  vec2 dist = u_mouse-vUv;
  float whRatio = u_resolution.x / u_resolution.y;
  dist.y /= whRatio / mWidth * mHeight;
  float percentageWidth = mWidth / u_resolution.x;
	return 1. - smoothstep(percentageWidth - smoothness,
                         percentageWidth + smoothness,
                         dot(dist,dist)*4.0);
}

float fbm( vec2 coord ) {
  int OCTAVES = 4;
  float value = 0.0;
  float scale = 0.3;

  for (int i=0;i< OCTAVES;i++) {
    value += noise( coord ) * scale;
    coord *= 2.0;
  }

  return value;
}



void main() {
  float whRatio = u_resolution.x / u_resolution.y;
  float percentageWidth = mWidth / u_resolution.x;

  vec4 texel = texture2D( tDiffuse, vUv );
  vec4 m = vec4(0.1,0.2,0.3,0.1);

  vec2 dist = u_mouse - vUv;
  dist.y /= whRatio / mWidth * mHeight;

  float mult = smoothstep(percentageWidth - smoothness, percentageWidth + smoothness, length( dist ));
  // working
  // texel.x *= ( mult * mult + newCol.x );
  // texel.y *= ( mult * mult + newCol.y );
  // texel.z *= ( mult * mult + newCol.z );

  vec3 color = vec3(circle(vUv,0.4));
  color.x *= newCol.x * 1.2;
  color.y *= newCol.y * 1.2;
  color.z *= newCol.z * 1.2;

  vec2 coord = vUv * 1.2;
  vec2 motion = vec2( fbm(coord + vec2(u_time * 1.0, u_time * -2.0 ) ) );
  float final = fbm( coord + motion );


  gl_FragColor = texel + vec4( color * final, 1.0 );
  // gl_FragColor = vec4( newCol, noise(vUv * 20.));
}