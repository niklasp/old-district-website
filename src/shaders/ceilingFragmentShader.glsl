uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform vec2 u_mouseSpeed;
uniform float u_time;       // Time in seconds since load
uniform sampler2D u_image;
uniform sampler2D tAudioData;
uniform sampler2D u_video;

varying vec2 vUv;
varying vec3 vNormal;

// void main() {
// 	float f = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r;

// 	vec3 col = vec3( 0., 4.0*f*(1.0-f), 1.0-f ) * f;
	
// 	gl_FragColor = vec4( col, 1.);
// }

// working example
void main() {
	vec2 nUv = vUv * 3./2.;
	vec3 backgroundColor = vec3( 0.125, 0.125, 0.125 );
	vec3 color = vec3( 1.0, 1.0, 0.0 );
	float f = texture2D( tAudioData, vec2( nUv.x, 0.0 ) ).r;
	float i = step( nUv.y, f ) * step( f - 0.0125, nUv.y );

// 	// convert frequency to colors
	vec3 col = vec3( 0., 4.0*f*(1.0-f), 1.0-f ) * f;

    // add wave form on top	
	// col += 1.0 - smoothstep( 0.0, 0.15, nUv.y );

	gl_FragColor = vec4( vec3(col), 1.0 );
}

// void main() {
//   vec2 nUv = vUv - 0.5;
//   nUv = ( vUv ) * 0.05;
//   vec4 audio = texture2D( tAudioData, nUv );
//   vec4 image = texture2D( u_image, vUv + audio.xy);
//   float val = audio.x;
//   gl_FragColor = image + image * audio;
// 	// image - audio;
// }

// void main() {
// 	vec2 nUv = vUv - 0.5;
// 	vec4 col = texture2D(tAudioData, nUv);
// 	// float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
// 	gl_FragColor = col;
// }

// void main() {
// 	vec3 backgroundColor = vec3( 0.125, 0.125, 0.125 );
// 	vec3 color = vec3( 1.0, 1.0, 0.0 );

// 	float f = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r;

// 	float i = step( vUv.y, f ) * step( f - 0.0125, vUv.y );

// 	gl_FragColor = vec4( mix( backgroundColor, color, i ), 1.0 );
// 	gl_FragColor = vec4( f, f, f, 1.0 );
// }

// void main() {
//     // create pixel coordinates
// 	vec2 uv = vUv;

//     // the sound texture is 512x2
//   int tx = int(uv.x*512.0);
    
// 	// first row is frequency data (48Khz/4 in 512 texels, meaning 23 Hz per texel)
// 	float fft = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r;

//   // second row is the sound wave, one texel is one mono sample
//   float wave = texture2D( tAudioData, vec2( vUv.y, 0.0 ) ).x;
	
// 	// convert frequency to colors
// 	vec3 col = vec3( 0., 4.0*fft*(1.0-fft), 1.0-fft ) * fft;

//     // add wave form on top	
// 	col += 1.0 - smoothstep( 0.0, 0.15, abs(wave - uv.y) );
	
// 	// output final color
// 	gl_FragColor = vec4(col,1.0);
// }

// void main() {
//   vec2 nUv = vec2( vUv - 0.5 );
//   vec2 vUvMouse = vec2( vUv.x - u_mouse.x, vUv.y - u_mouse.y);
//   vec2 dxy = pixelSize * 2./ resolution;
//   float circle = smoothstep(
//     0.1,
//     1.,
//     dot(nUv, nUv) * 4.
//   );
//   vec2 pixelated = (dxy * floor( vUv / dxy ) );

//   //around mouse
//   vec2 mouseUv = nUv;
//   mouseUv += ( pixelated - 0.5 ) * ( distance( u_mouse, mouseUv + 0.5) * 1.) * length(u_mouseSpeed) * 4.;

//   //end around mouse


//   // gl_FragColor = texture2D(tDiffuse, pixelated - circle);
//   // gl_FragColor = texture2D( tDiffuse, vUv + nUv / 4.); // add border effect lines
//   // gl_FragColor = texture2D( u_image, vUv + (1. - circle) * mouseUv / 4.); // dont distort center with circle
//   gl_FragColor = texture2D( u_image, vUv - nUv * ( u_mouse )); //somehow working
//   // gl_FragColor = texture2D( u_image, mouseUv + 0.5); //try to only apply at mouse position
//   // gl_FragColor = vec4( circle, length(u_mouseSpeed), circle, 1.0 );
// }

// void main() {
//     // create pixel coordinates
// 	vec2 uv = vUv;

// 	// the sound texture is 512x2
// 	int tx = int(uv.x*512.0);
    
// 	// first row is frequency data (48Khz/4 in 512 texels, meaning 23 Hz per texel)
// 	float fft  = texelFetch( tAudioData, ivec2(tx,0), 0 ).x; 

// 	// second row is the sound wave, one texel is one mono sample
// 	float wave = texelFetch( tAudioData, ivec2(tx,1), 0 ).x;
	
// 	// convert frequency to colors
// 	vec3 col = vec3( fft, 4.0*fft*(1.0-fft), 1.0-fft ) * fft;

//     // add wave form on top	
// 	col += 1.0 -  smoothstep( 0.0, 0.15, abs(wave - uv.y) );
	
// 	// output final color
// 	gl_FragColor = vec4(col,1.0);
// }

//
// Color version of: https://www.shadertoy.com/view/XlXGDf
//
// Based on: https://www.shadertoy.com/view/4dfSRS
//

// #define PI 3.14159

// vec4 audioEq() {
//     float vol = 0.0;
    
//     // bass
//     float lows = 0.0;
//     for(float i=0.;i<85.; i++){
//         float v =  texture(tAudioData, vec2(i/85., 0.0)).x;
//         lows += v*v;
//         vol += v*v;
//     }
//     lows /= 85.0;
//     lows = sqrt(lows);
    
//     // mids
//     float mids = 0.0;
//     for(float i=85.;i<255.; i++){
//         float v =  texture(tAudioData, vec2(i/170., 0.0)).x;
//         mids += v*v;
//         vol += v*v;
//     }
//     mids /= 170.0;
//     mids = sqrt(mids);
    
//     // treb
//     float highs = 0.0;
//     for(float i=255.;i<512.; i++){
//         float v =  texture(tAudioData, vec2(i/255., 0.0)).x;
//         highs += v*v;
//         vol += v*v;
//     }
//     highs /= 255.0;
//     highs = sqrt(highs);
    
//     vol /= 512.;
//     vol = sqrt(vol);
    
//     return vec4( lows * 1.5, mids * 1.25, highs * 1.0, vol ); // bass, mids, treb, volume
// }

// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
// 	vec2 uv = fragCoord.xy / iResolution.xy;
//     uv = abs( 2.05 * ( uv - 0.5 ) );

//     vec4 eq = audioEq();
// 	float theta = 0.5 * ( 1.0 / ( PI * 0.5 ) ) * atan( uv.x, uv.y );
// 	float r = length( uv );
// 	float a = 0.01 - r;
// 	uv = vec2( theta, r );

// 	float t1 = texture( tAudioData, vec2( uv.x, 0.9 ) ).x;
// 	float t2 = texture( tAudioData, vec2( uv.y, 0.9 ) ).x;
//     float y = t1 * t2 * a * 16.9;
    
// 	fragColor = vec4( sin( y * ( 3.0 * PI ) * eq.x ), 
//                       sin( y * ( 3.0 * PI ) * eq.x ), 
//                       sin( y * ( 3.0 * PI ) * eq.x ), 
//                       1.0); 
// }

// uniform vec2 u_resolution;  // Canvas size (width,height)
// uniform vec2 u_mouse;       // mouse position in screen pixels
// uniform float u_time;       // Time in seconds since load
// uniform sampler2D tAudioData;
// uniform sampler2D u_image;
// uniform vec2 resolution;

// varying vec2 vUv;
// varying vec3 vNormal;

// float squared(float value) {
// 	return value * value;
// }

// float getAmp(float frequency) {
// 	return texture2D(tAudioData, vec2(frequency / 512.0, 0)).x;
// }

// float getWeight(float f) {
// 	return (+ getAmp(f-2.0) + getAmp(f-1.0) + getAmp(f+2.0) + getAmp(f+1.0) + getAmp(f)) / 5.0;
// }

// #define P 3.14159
// #define PI 3.14159
// #define E .001

// #define T .03 // Thickness
// #define W 2.  // Width
// #define A .29 // Amplitude
// #define V 0.5  // Velocity

// void main() {
  //   gl_FragColor = vec4(vUv, 0.0, 1.0);
  // gl_FragColor = vec4(vNormal, 1.0);

				// vec3 backgroundColor = vec3( 0.125, 0.125, 0.125 );
				// vec3 color = vec3( 0.5, vvUv.x, vUv.y );

				// float f = texture2D( tAudioData, vec2( vUv.x, vUv.y ) ).x;
        // float g = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).y;
				// float i = smoothstep( vUv.x, 0.0, f );

				// gl_FragColor = vec4( mix( backgroundColor, color, f ), 1.0 );
  // gl_FragColor = vec4( 0.5 + vUv.x, 0.1, 0.8, 1.0 );
	// gl_FragColor = texture2D( u_image, vUv + tAudioData);
		// vec2 uvTrue = gl_gl_FragCoord.xy / 30. / 20.;
    // vec2 uv = -1.0 + 2.0 * uvTrue;

    // vec2 uv = gl_gl_FragCoord.xy / u_resolution;
    // float fft = texture2D( tAudioData, vec2(uv.x * 0.25, 1.)).x;
    // gl_FragColor = vec4(uv * pow(fft, 2.0), 0., 1.);

		// float lineIntensity	;
    // float glowWidth = 0.1;
    // vec3 color = vec3(0.0);

		// for(float i = 0.0; i < 5.0; i++) {
		// 	uv.y += (0.2 * sin(uv.x + i/7.0 - u_time * 0.6));
		// 	color += vec3(glowWidth * (2.0 + sin(u_time * 0.13)),
		// 										glowWidth * (2.0 - sin(u_time * 0.23)),
		// 										glowWidth * (2.0 - cos(u_time * 0.19)));
		// }

	// for(float i = 0.0; i < 5.0; i++) {
        
	// 	uv.y += (0.2 * sin(uv.x + i/7.0 - u_time * 0.6));
  //       float Y = uv.y + getWeight(squared(i) * 20.0) *
  //           (texture(tAudioData, vec2(uvTrue.x, 1)).x - 0.5);
  //       lineIntensity = 0.4 + squared(1.6 * abs(mod(uvTrue.x + i / 1.3 + u_time,2.0) - 1.0));
	// 	glowWidth = abs(lineIntensity / (150.0 * Y));
	// 	color += vec3(glowWidth * (2.0 + sin(u_time * 0.13)),
  //                     glowWidth * (2.0 - sin(u_time * 0.23)),
  //                     glowWidth * (2.0 - cos(u_time * 0.19)));
	// }	

	// gl_FragColor = vec4(color, 1.0);

	// vec2 c = gl_gl_FragCoord.xy / 600.;
	// float s = texture(tAudioData, c * .5).r;
	// c = vec2(0, A*s*sin((c.x*W+u_time*V)* 2.5)) + (c*2.-1.);
	// float g = max(abs(s/(pow(c.y, 2.1*sin(s*P))))*T,
	// 			  abs(.1/(c.y+E)));
	// gl_FragColor = vec4(g*g*s*.6, g*s*.44, g*g*.7, 1);

	// vec2 uv = vUv;
	// uv = abs( 2.0 * ( uv - 0.5 ) );

	// float theta = 1.0 * ( 1.0 / ( PI / 2.0 ) ) * atan( uv.x, uv.y );
	// float r = length( uv );
	// float a = 0.01 - r;
	// uv = vec2( theta, r );

	// vec4 t1 = texture2D( tAudioData, vec2( uv[0], 0.9 ) );
	// vec4 t2 = texture2D( tAudioData, vec2( uv[1], 0.9 ) );
	// float y = t1[3] * t2[0] * a * 1500.5;
	// gl_FragColor = vec4( sin( y * PI ), sin( y * PI ), sin( y * PI ), 1.0 );
// }

// vec2 hash(in vec2 p) 
// {
//     p = vec2( dot(p,vec2(127.1,311.7)),
// 			  dot(p,vec2(299.5,783.3)) );

// 	return -1.0 + 2.0*fract(sin(p)*43758.545);
// }

// float noise(in vec2 p) 
// {
//     vec2 p00 = floor(p);
//     vec2 p10 = p00 + vec2(1.0, 0.0);
//     vec2 p01 = p00 + vec2(0.5, 1.0);
//     vec2 p11 = p00 + vec2(1.0, 1.0);
    
//     vec2 s = p - p00;
    
//     float a = dot(hash(p00), s);
// 	float b = dot(hash(p10), p - p10);
// 	float c = dot(hash(p01), p - p01);
// 	float d = dot(hash(p11), p - p11);

//     vec2 q = s*s*s*(s*(s*6.0 - 15.0) + 10.0);

//     float c1 = b - a;
//     float c2 = c - a;
//     float c3 = d - c - b + a;

//    	return a + q.x*c1 + q.y*c2 + q.x*q.y*c3;
// }


// float fbm(vec2 p) 
// {
// 	float h = noise(p) * texture(tAudioData, vec2(0.0, 0.0)).r;
//     h += noise(p * 2.0) * texture(tAudioData, vec2(0.25, 0.0)).r * 0.5;
//     h += noise(p * 4.0) * texture(tAudioData, vec2(0.50, 0.0)).r * 0.25;
//     h += noise(p * 8.0) * texture(tAudioData, vec2(0.75, 0.0)).r * 0.125;
    
//     return h;
// }

// // Taken from http://iquilezles.org/www/articles/palettes/palettes.htm
// vec3 ColorPalette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
// {
//     return a + b*cos( 6.28318*(c*t+d) );
// }

// vec3 ContourLines(vec2 p) 
// {
// 	float h = fbm(p*5.5)*10.0;
//     float t = fract(h);
//     float b = 1.0 - fract(h + 1.0);
//     return ColorPalette(h*0.1,
//                         vec3(1.0), vec3(0.7), vec3(1.0), vec3(0.0, 0.333, 0.666)) * 
//                (pow(t, 16.0) + pow(b, 4.0));
        
// }

// vec2 Position() 
// {
// 	return vec2(noise(vec2(u_time*0.014)), noise(vec2(u_time*0.012))) +
//            vec2(0.0, u_time * 0.025);
// }

// void main()
// {
//   vec2 p = Position() + (gl_FragCoord.xy / max(u_resolution.x, u_resolution.y));
// 	gl_FragColor = vec4(pow(ContourLines(p), vec3(0.55)), 1.0);
// }

//
// Color version of: https://www.shadertoy.com/view/XlXGDf
//
// Based on: https://www.shadertoy.com/view/4dfSRS
//

// #define PI 3.14159

// vec4 audioEq() {
//     float vol = 0.0;
    
//     // bass
//     float lows = 0.0;
//     for(float i=0.;i<85.; i++){
//         float v =  texture(tAudioData, vec2(i/85., 0.0)).x;
//         lows += v*v;
//         vol += v*v;
//     }
//     // lows /= 85.0;
//     lows = sqrt(lows) * 10.;
    
//     // mids
//     float mids = 0.0;
//     for(float i=85.;i<255.; i++){
//         float v =  texture(tAudioData, vec2(i/170., 0.0)).x;
//         mids += v*v;
//         vol += v*v;
//     }
//     // mids /= 170.0;
//     mids = sqrt(mids) * 10.;
    
//     // treb
//     float highs = 0.0;
//     for(float i=255.;i<512.; i++){
//         float v =  texture(tAudioData, vec2(i/255., 0.0)).x;
//         highs += v*v;
//         vol += v*v;
//     }
//     // highs /= 255.0;
//     highs = sqrt(highs) * 10.;
    
//     // vol /= 512.;
//     vol = sqrt(vol) * 10.;
    
//     return vec4( lows * 1.5, mids * 1.25, highs * 1.0, vol ); // bass, mids, treb, volume
// }

// void main()
// {
// 	vec2 uv = (vUv - 0.5) * 0.3;
//     uv = abs( 2.05 * ( uv - 0.5 ) );

//     vec4 eq = audioEq();
// 	float theta = 0.5 * ( 1.0 / ( PI * 0.5 ) ) * atan( uv.x, uv.y );
// 	float r = length( uv );
// 	float a = 0.01 - r;
// 	uv = vec2( theta, r );

// 	float t1 = texture( tAudioData, vec2( uv.x, 0.9 ) ).x;
// 	float t2 = texture( tAudioData, vec2( uv.y, 0.9 ) ).x;
//   float y = t1 * t2 * a * 16.9;

// 	gl_FragColor = vec4( sin( y * ( 3.0 * PI ) * eq.x ), 
//                       sin( y * ( 3.0 * PI ) * eq.x ), 
//                       sin( y * ( 3.0 * PI ) * eq.x ), 
//                       1.0); 
// }

// const int numWaves = 6;
// const float numStripes = 1.0;
// const float numFreqs = 8.0;
// const float meanFreq = 5.0;
// const float stdDev = 2.0;
// const float period = 5.0;
// const float pi = 4.0 * atan(1.0);
// const float pi2 = 2.0 * pi;
// const float ln2 = log(2.0);
// const float mean = meanFreq * .59314718;

// float wavething(int n, float x){
//     float l = ln2 * float(n) + log(x);
//     l -= mean;
//     return exp(-l * l / stdDev) / 2.0;
// }

// void main()
// {
//     gl_FragColor = vec4(0.0);
//     float scale = exp2(-fract(u_time / period));
//     float sum1 = 0.0;
//     for(int n = 0; n < int(numFreqs); n++){
//         sum1 += wavething(n, scale);
//     }
//     vec2 xy = pi2 * numStripes
//         * ((2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y);
    
//     float sum2 = 0.0;
//     for(int n = 0; n < numWaves; n++){
//         float theta = pi * float(n) / float(numWaves);
//         vec2 waveVec = vec2(cos(theta), sin(theta));
//         float phase = dot(xy, waveVec);
//         for(int k = 0; k < int(numFreqs); k++){
//             sum2 += cos(phase * scale * exp2(float(k))) * wavething(k, scale);
//         }
//     }
//     gl_FragColor += vec4(1.0 - sum2 / sum1);
//     xy /= pi2 * numStripes;
//     float r = length(xy) * 0.35;
//     if(sum2 / sum1 < .5){
//         gl_FragColor.x *= 2.0;
//         gl_FragColor.y *= texture(tAudioData, vec2(.161616 * r + .161616, .2)).x;
//         gl_FragColor.z *= texture(tAudioData, vec2(.161616 * r + .333333, .2)).x;
//         gl_FragColor = 1.0 - gl_FragColor;
//     }
//     // gl_FragColor = 1.0 - (r + 1.0) * gl_FragColor;
//     // if(length(gl_FragColor) > 3.0) gl_FragColor = vec4(0.0);
// }

