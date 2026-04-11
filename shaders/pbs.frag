#version 330

in vec3 fragPos;      // Passato dal Vertex Shader in VIEW space
in vec3 fragNormal;   // Passato dal Vertex Shader in VIEW space
in vec2 fragTexCoord;

out vec4 frag_color;

uniform mat4 view;

// --- Parametri C++ ---
uniform vec3  light;      // Posizione della luce in WORLD space
uniform vec3 fresnel;
uniform float roughness;  // Slider UI per la ruvidità globale
uniform float metalness;  // Slider UI per la metallicità globale

uniform int current_texture;

// --- Texture del materiale ---
uniform sampler2D color_map;
uniform sampler2D roughness_map;
uniform sampler2D metalness_map;

const float PI = 3.14159265359;

// --- LIBRERIA FUNZIONI BRDF ---

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float GeometrySchlickGGX(float NdotX, float rough) {
    float r = rough + 1.0;
    float k = (r * r) / 8.0;
    return NdotX / max(NdotX * (1.0 - k) + k, 1e-7);
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float rough) {
    return GeometrySchlickGGX(max(dot(N, V), 0.0), rough)
         * GeometrySchlickGGX(max(dot(N, L), 0.0), rough);
}

float DistributionGGX(vec3 N, vec3 H, float rough) {
    float a      = rough * rough;
    float a2     = a * a;
    float NdotH  = max(dot(N, H), 0.0);
    float denom  = (NdotH * NdotH * (a2 - 1.0) + 1.0);
    return a2 / max(PI * denom * denom, 1e-7);
}

// --- PROGRAMMA PRINCIPALE ---

void main(void) {
    // 1. COSTRUZIONE DEI VETTORI IN VIEW SPACE
    vec3 N = normalize(fragNormal);
    vec3 V = normalize(-fragPos);

    vec3 lightPosView = vec3(view * vec4(light, 1.0));
    vec3 L = normalize(lightPosView - fragPos);
    vec3 H = normalize(V + L);

    float NdotL = max(dot(N, L), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // 2. LOGICA DEI MATERIALI
    vec3 albedo;
    float rough;
    float metal;

    if (current_texture == 1) {
        // MODALITÀ TEXTURE (Punto 3b)
        albedo = texture(color_map, fragTexCoord).rgb;
        albedo = pow(albedo, vec3(2.2)); // De-gamma: Spazio Lineare
        rough  = texture(roughness_map, fragTexCoord).r;
        metal  = texture(metalness_map, fragTexCoord).r;
    } else {
        // MODALITÀ GUI (Punto 3a)
        albedo = vec3(0.8, 0.2, 0.2); // Rosso fisso per test dei dielettrici
        rough  = roughness;
        metal  = metalness;
    }

    float roughClamped = max(rough, 0.05);
    vec3 F0 = mix(fresnel, albedo, metal);

    // 4. EQUAZIONE DI COOK-TORRANCE (Illuminazione Diretta)
    vec3 Lo = vec3(0.0);

    // IL FIX DEL NAN: Calcoliamo la luce SOLO se il faretto colpisce il pixel
    if (NdotL > 0.0) {
        vec3  F = fresnelSchlick(VdotH, F0);
        float D = DistributionGGX(N, H, roughClamped);
        float G = GeometrySmith(N, V, L, roughClamped);

        float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL;
        vec3 specular = (D * G * F) / max(denominator, 0.001);

        vec3 kS = F;
        vec3 kD = (vec3(1.0) - kS) * (1.0 - metal);

        vec3 radiance = vec3(0.1) * 10.0;
        Lo = (kD * albedo / PI + specular) * radiance * NdotL;
    }

    // 5. ILLUMINAZIONE FINALE E GAMMA CORRECTION
    // Aggiungiamo una minuscola luce base (2%) per non avere un nero assoluto
    vec3 ambient = vec3(0.02) * albedo;
    vec3 color = ambient + Lo;

    // Ritorno allo spazio sRGB per il monitor
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}