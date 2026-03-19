#version 330

in vec3 fragPos;
in vec3 fragNormal;
in vec2 fragTexCoord;

out vec4 frag_color;

uniform mat4 view;

// Parametri globali
uniform vec3 light;
uniform vec3 fresnel;
uniform float roughness;
uniform float metalness;

// Texture Maps
uniform sampler2D color_map;
uniform sampler2D roughness_map;
uniform sampler2D metalness_map;

const float PI = 3.14159265359;

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float DistributionGGX(vec3 N, vec3 H, float rough) {
    float a      = rough * rough;
    float a2     = a * a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float nom    = a2;
    float denom  = (NdotH2 * (a2 - 1.0) + 1.0);
    denom        = PI * denom * denom;

    return nom / max(denom, 0.0000001);
}

void main(void) {

    // 1. Preparazione dei Vettori Fondamentali
    vec3 N = normalize(fragNormal);

    vec3 camPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 V = normalize(camPos - fragPos);

    // CORREZIONE APPLICATA: Vettore della Point Light
    vec3 L = normalize(light - fragPos);
    vec3 H = normalize(V + L);

    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // 2. Lettura e moltiplicazione dei materiali
    vec3 albedo_tex = texture(color_map, fragTexCoord).rgb;
    albedo_tex = pow(albedo_tex, vec3(2.2)); // Spazio lineare

    float rough_tex = texture(roughness_map, fragTexCoord).r;
    float metal_tex = texture(metalness_map, fragTexCoord).r;

    // LA MAGIA: I pixel della texture moltiplicati per l'intensità dello slider UI
    float rough = clamp(rough_tex * roughness, 0.0, 1.0);
    float metal = clamp(metal_tex * metalness, 0.0, 1.0);

    // CORREZIONE APPLICATA: Unica dichiarazione di F0
    vec3 F0 = mix(fresnel, albedo_tex, metal);

    // 3. Calcolo Cook-Torrance BRDF
    vec3  F = fresnelSchlick(VdotH, F0);
    float D = DistributionGGX(N, H, max(rough, 0.01));

    vec3 specular = (D * F) / 4.0;

    // 4. Conservazione dell'energia
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= (1.0 - metal);

    vec3 radiance = vec3(1.0);

    vec3 color = (kD * albedo_tex / PI + specular) * radiance * NdotL;

    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}