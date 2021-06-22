varying vec4 v_color;
varying vec3 v_n;
varying vec3 v_pos;
uniform float u_specularExponent;
uniform vec3 u_specularColor;

void computeSingleLight(inout float diffuse,inout float specular,vec3 normal,vec3 toEye,vec3 lightDir,float lightIntensity,float specularExponent)
{
  diffuse+=lightIntensity*max(dot(normal,lightDir),0.);
  vec3 toReflectedLight=reflect(lightDir,normal);
  float specularDot=max(dot(toReflectedLight,toEye),0.);
  specular+=lightIntensity*pow(specularDot,specularExponent);
}

vec4 computeLighting(vec3 normalIn,vec3 position,float specularExponent,vec3 specularColor,vec4 inputColor)
{
  vec3 normal=normalize(normalIn);
  vec3 toEye=normalize(position);
  normal=faceforward(normal,vec3(0.,0.,1.),-normal);
  
  float ambient=.2;
  vec3 lightPos1=vec3(-500,-200.,0.);
  vec3 lightPos2=vec3(500,200.,0.);
  vec3 lightDir1=normalize(lightPos1-position);
  vec3 lightDir2=normalize(lightPos2-position);
  
  float diffuseIntensity=0.;
  float specularIntensity=0.;
  
  computeSingleLight(diffuseIntensity,specularIntensity,normal,toEye,lightDir1,.35,specularExponent);
  computeSingleLight(diffuseIntensity,specularIntensity,normal,toEye,lightDir2,.45,specularExponent);
  computeSingleLight(diffuseIntensity,specularIntensity,normal,toEye,czm_sunDirectionEC,.25,specularExponent);
  
  vec3 diffuseAndAmbient=inputColor.rgb*min(1.,diffuseIntensity+ambient);
  vec3 specular=specularColor.rgb*min(1.,specularIntensity);
  
  return vec4(diffuseAndAmbient+specular,inputColor.a);
}

void gltf_clip_main()
{
  gl_FragColor=computeLighting(v_n,v_pos,u_specularExponent,u_specularColor,v_color);
}
vec4 getClippingPlane(highp sampler2D packedClippingPlanes,int clippingPlaneNumber,mat4 transform)
{
  int pixY=clippingPlaneNumber/1;
  int pixX=clippingPlaneNumber-(pixY*1);
  float u=(float(pixX)+.5)*1.;
  float v=(float(pixY)+.5)*.5;
  vec4 plane=texture2D(packedClippingPlanes,vec2(u,v));
  return czm_transformPlane(plane,transform);
}

float clip(vec4 fragCoord,sampler2D clippingPlanes,mat4 clippingPlanesMatrix)
{
  bool clipped=true;
  vec4 position=czm_windowToEyeCoordinates(fragCoord);
  vec3 clipNormal=vec3(0.);
  vec3 clipPosition=vec3(0.);
  float clipAmount=0.;
  float pixelWidth=czm_metersPerPixel(position);
  for(int i=0;i<1;++i)
  {
    vec4 clippingPlane=getClippingPlane(clippingPlanes,i,clippingPlanesMatrix);
    clipNormal=clippingPlane.xyz;
    clipPosition=-clippingPlane.w*clipNormal;
    float amount=dot(clipNormal,(position.xyz-clipPosition))/pixelWidth;
    clipAmount=max(amount,clipAmount);
    clipped=clipped&&(amount<=0.);
  }
  if(clipped)
  {
    discard;
  }
  return clipAmount;
}

uniform highp sampler2D gltf_clippingPlanes;
uniform mat4 gltf_clippingPlanesMatrix;
uniform vec4 gltf_clippingPlanesEdgeStyle;
void tile_main()
{
  gltf_clip_main();
  float clipDistance=clip(gl_FragCoord,gltf_clippingPlanes,gltf_clippingPlanesMatrix);
  vec4 clippingPlanesEdgeColor=vec4(1.);
  clippingPlanesEdgeColor.rgb=gltf_clippingPlanesEdgeStyle.rgb;
  float clippingPlanesEdgeWidth=gltf_clippingPlanesEdgeStyle.a;
  if(clipDistance>0.&&clipDistance<clippingPlanesEdgeWidth)
  {
    gl_FragColor=clippingPlanesEdgeColor;
  }
}
uniform float tile_colorBlend;
void tile_color(vec4 tile_featureColor)
{
  tile_main();
  tile_featureColor=czm_gammaCorrect(tile_featureColor);
  gl_FragColor.a*=tile_featureColor.a;
  float highlight=ceil(tile_colorBlend);
  gl_FragColor.rgb*=mix(tile_featureColor.rgb,vec3(1.),highlight);
}
uniform sampler2D tile_pickTexture;
varying vec2 tile_featureSt;
varying vec4 tile_featureColor;
void main()
{
  tile_color(tile_featureColor);
}