#define GLSLIFY 1
varying vec2 vUv; 
uniform sampler2D tDiffuse;
// uniform sampler2D tDiffuse;
varying vec2 vUv2;
uniform float fade;
uniform float gamma;
uniform float dattime;

uniform bool postfilm;
uniform bool postcolor;

// #ifndef OPTI
// #endif

uniform float vignamount;
uniform float vignfalloff;

#define GammaCorrection(color, gamma) pow( color, 1.0 / vec3(gamma))
#define LevelsControlInputRange(color, minInput, maxInput)  min(max(color - vec3(minInput), 0.0) / (vec3(maxInput) - vec3(minInput)), 1.0)
#define LevelsControlInput(color, minInput, gamma, maxInput) GammaCorrection(LevelsControlInputRange(color, minInput, maxInput), gamma)
#define LevelsControlOutputRange(color, minOutput, maxOutput)  mix(vec3(minOutput), vec3(maxOutput), color)
#define LevelsControl(color, minInput, gamma, maxInput, minOutput, maxOutput)   LevelsControlOutputRange(LevelsControlInput(color, minInput, gamma, maxInput), minOutput, maxOutput)

#define smoothness 0.4

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float rand(vec2 co)
{
   return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

float when_eq(float x, float y) {
  return 1.0 - abs(sign(x - y));
}

vec4 getGlitch(sampler2D inTex, float noise, float xpos){

    vec4 final = texture2D(inTex, vec2(xpos, vUv.y));

    final.rgb = mix(final.rgb, vec3(rand(vec2(vUv.y * dattime))), noise * 0.3).rgb;
    
        // Apply a line pattern every 4 pixels
    final.rgb *= mix(1.0 - (0.15 * noise), 1.0, when_eq(floor(mod(vUv.y * 0.5, 1.0)), 0.0) );
    
    // Shift green/blue channels (using the red channel)
    final.g = mix(final.g, texture2D(inTex, vec2(xpos + noise * 0.05, vUv.y)).g, 1.0);
    final.b = mix(final.b, texture2D(inTex, vec2(xpos - noise * 0.05, vUv.y)).b, 1.0);

    // float rr=  texture2D(inTex, vUv + vec2(-noise * 0.1, 0.0)).r;

    return mix(final,  texture2D(inTex, vUv + vec2(-noise * 0.1, 0.0)), 0.2);
}

vec3 scanline(vec2 coord, vec3 screen){
    const float scale = 0.001;
    const float amt = 0.035;// intensity of effect
    const float spd = 2.0;//speed of scrolling rows transposed per second
    
    screen.rgb += sin((coord.y / scale - (dattime * spd * 6.28))) * amt;
    return screen;
}

void main() { 

        // Create large, incidental noise waves
    float noise = max(0.0, snoise(vec2(dattime, vUv.y * 0.3)) - 0.3) * (1.42857);
    
    // Offset by smaller, constant noise waves
    noise = noise + (snoise(vec2(dattime*10.0, vUv.y * 2.4)) - 0.5) * 0.15;
        
        // noise *=  smoothstep(0.5, 1.0, ((sin(dattime) * 0.5) + 1.0)) * 0.5;
    noise *=  max(1.0 - dattime * 0.5, 0.0);

    vec4 base = vec4(1.0);
    if(noise == 0.0 || ! postcolor ){
        base = texture2D(tDiffuse, vUv);
    }
    else {

        // Apply the noise as x displacement for every line
        float xpos = vUv.x - (noise * noise * 0.035);
        base = getGlitch(tDiffuse, noise, xpos);
    }
   
    // vec4 base         = texture2D(tDiffuse, vUv);
    
    vec4 blend        = texture2D(tDiffuse, vUv);

    vec4 final        = (1.0 - ((1.0 - base) * (1.0 - blend)));

    float dist        = distance(vUv2, vec2(0.5));

    // final.rgb       =  LevelsControl(final.rgb, 0.0, gamma, 1.0, 0.0, 0.9);

    final.rgb        *= smoothstep(0.8, vignfalloff * 0.799, dist * (vignamount + vignfalloff));

    if ( postfilm ) {
      final.rgb = scanline(vUv, final.rgb);
    }

    gl_FragColor      = final;

}