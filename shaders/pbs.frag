#version 330

in vec3 fragPos;
in vec3 fragNormal;
in vec2 fragTexCoord;

out vec4 frag_color;

uniform mat4 view;

// Parametri globali (li lasciamo dichiarati nel caso il C++ li invii ancora,
// ma useremo le texture per i calcoli)
uniform vec3 light;      // Posizione/Direzione della luce
uniform vec3 fresnel;    // Il valore F0 dalla UI
uniform float roughness; // Slider globale (non usato in questa versione)
uniform float metalness; // Slider globale (non usato in questa versione)

// Texture Maps (Assicurati che questi nomi corrispondano a quelli nel C++!)
uniform sampler2D color_map;
uniform sampler2D roughness_map;
uniform sampler2D metalness_map;

const float PI = 3.14159265359;

// FIX #1: Il cosTheta corretto per Schlick e' dot(V, H)
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Distribuzione GGX (Trowbridge-Reitz)
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

    // Ricaviamo la posizione della camera dal World Space invertendo la View Matrix
    vec3 camPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 V = normalize(camPos - fragPos);

    // Correzione applicata: Punto della luce - Posizione del frammento
    vec3 L = normalize(light - fragPos);
    vec3 H = normalize(V + L);  // Half-vector tra vista e luce

    // Prodotti scalari utili (clampati a 0 per evitare contributi negativi)
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    float VdotH = max(dot(V, H), 0.0);  // Angolo corretto per Fresnel

    // 2. Lettura dei materiali dalle Mappe (Punto 3b dell'assignment)
    vec3 albedo = texture(color_map, fragTexCoord).rgb;
    // IMPORTANTE: Trasformiamo l'albedo da sRGB a Spazio Lineare per la fisica corretta
    albedo = pow(albedo, vec3(2.2));

    // Leggiamo la rugosità e la metallicità dal canale rosso delle rispettive immagini
    float rough = texture(roughness_map, fragTexCoord).r;
    float metal = texture(metalness_map, fragTexCoord).r;

    // FIX #2: Usiamo la variabile 'metal' appena letta dalla texture
    vec3 F0 = mix(fresnel, albedo, metal);

    // 3. Calcolo Cook-Torrance BRDF
    vec3  F = fresnelSchlick(VdotH, F0);

    // Usiamo la variabile 'rough' appena letta dalla texture (con un limite minimo per evitare divisioni per zero)
    float D = DistributionGGX(N, H, max(rough, 0.01));

    // --- CHEAP OPTION (da assignment) ---
    vec3 specular = (D * F) / 4.0;

    // 4. Conservazione dell'energia: diffuse + specular <= 1
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= (1.0 - metal);  // Usiamo la variabile 'metal' della texture

    // Radianza della luce
    vec3 radiance = vec3(1.0);

    // Equazione di rendering completa
    vec3 color = (kD * albedo / PI + specular) * radiance * NdotL;

    // Gamma correction (spazio lineare -> sRGB per i monitor standard)
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}