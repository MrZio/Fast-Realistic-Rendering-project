#version 330

in vec3 fragPos;      // Passato dal Vertex Shader in VIEW space
in vec3 fragNormal;   // Passato dal Vertex Shader in VIEW space
in vec2 fragTexCoord;

out vec4 frag_color;

uniform mat4 view;

uniform vec3  light;      // Posizione della luce in WORLD space
uniform vec3  fresnel;    // Slider UI (ignorato per l'albedo per mantenere la fisica corretta)
uniform float roughness;  // Slider UI per la ruvidità globale
uniform float metalness;  // Slider UI per la metallicità globale

// L'interruttore del C++: 0 = Slider GUI, 1 = Texture
uniform int use_texture;

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
    float k = (r * r) / 8.0; // Valido per luci analitiche (Point/Directional)
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

    // In View Space, la telecamera è l'origine (0,0,0)
    vec3 V = normalize(-fragPos);

    // Convertiamo la posizione della luce da World Space a View Space
    vec3 lightPosView = vec3(view * vec4(light, 1.0));
    vec3 L = normalize(lightPosView - fragPos); // Faretto (Point Light)

    vec3 H = normalize(V + L);

    float NdotL = max(dot(N, L), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // 2. LOGICA DEI MATERIALI (Il Bivio Universitario)
    vec3 albedo;
    float rough;
    float metal;

    if (use_texture == 1) {
        // MODALITÀ TEXTURE (Punto 3b dell'assignment)
        albedo = texture(color_map, fragTexCoord).rgb;
        albedo = pow(albedo, vec3(2.2)); // Spazio Lineare per la corretta fisica

        rough  = texture(roughness_map, fragTexCoord).r;
        metal  = texture(metalness_map, fragTexCoord).r;
    } else {
        // MODALITÀ GUI (Punto 3a dell'assignment)
        // Colore fisso per evitare il bug fisico della "plastica nera"
        albedo = vec3(0.8, 0.2, 0.2);
        rough  = roughness;
        metal  = metalness;
    }

    // Clamp minimo per la roughness (evita artefatti visivi e divisioni per zero)
    float roughClamped = max(rough, 0.05);

    // 3. RIFLETTANZA DI BASE (F0)
    // Regola aurea: 0.04 per i dielettrici, colore base (albedo) per i metalli
    vec3 F0 = mix(vec3(0.04), albedo, metal);

    // 4. EQUAZIONE DI COOK-TORRANCE
    vec3  F = fresnelSchlick(VdotH, F0);
    float D = DistributionGGX(N, H, roughClamped);
    float G = GeometrySmith(N, V, L, roughClamped);

    // Calcolo speculare con denominatore protetto da divisioni per zero
    vec3 specular = (D * G * F) / max(4.0 * max(dot(N, V), 0.0) * NdotL, 1e-4);

    // 5. CONSERVAZIONE DELL'ENERGIA
    vec3 kS = F;
    vec3 kD = (vec3(1.0) - kS) * (1.0 - metal);

    // 6. ILLUMINAZIONE E GAMMA CORRECTION
    vec3 radiance = vec3(1.0) * 10.0; // Moltiplicatore per l'intensità del faretto
    vec3 color = (kD * albedo / PI + specular) * radiance * NdotL;

    // Ritorno allo spazio sRGB per il monitor
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}