// Uniforms
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uCloudsTexture;
uniform vec3 uSunDirection;

// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Includes

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Direction
    float sunOrientation = dot(uSunDirection, normal);

    // Day/Night Color
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;

    color = mix(nightColor, dayColor, dayMix);

    // Final color
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
