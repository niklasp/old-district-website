varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D tAudioData;
uniform float u_time;

void main() {
  vUv = uv;
  vec3 newPosition = position;
  float f = texture2D( tAudioData, vec2( vUv.x, vUv.y ) ).x;
  // float g = texture2D( tAudioData, vec2( vUv.y, 1.0 ) ).y;
  newPosition.x = position.x;
  newPosition.y = position.y;

  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  // gl_Position = vec4( position, 1.0 );
}