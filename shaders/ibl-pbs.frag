#version 330

in vec3 fragPos;      // Passato dal Vertex Shader in VIEW space
in vec3 fragNormal;   // Passato dal Vertex Shader in VIEW space
in vec2 fragTexCoord;

out vec4 frag_color;

const float MAX_REFLECTION_LOD = 4.0;
uniform mat4 view;

// --- IBL Maps (Nomi esatti che invia il tuo C++) ---
uniform samplerCube diffuse_map;   // Questa è l'irradianza (luce diffusa)
uniform samplerCube specular_map;  // Questo è il cielo prefiltrato (mipmap)

// --- Parametri C++ ---
uniform vec3  light;      // Posizione della luce in WORLD space
uniform vec3  fresnel;    // Slider UI
uniform float roughness;  // Slider UI per la ruvidità globale
uniform float metalness;  // Slider UI per la metallicità globale

// L'interruttore del C++: 0 = Slider GUI, 1 = Texture
uniform int current_texture; // RINOMINATO PER COMBACIARE COL C++

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
        // MODALITÀ TEXTURE
        albedo = texture(color_map, fragTexCoord).rgb;
        albedo = pow(albedo, vec3(2.2)); // De-gamma: Spazio Lineare
        rough  = texture(roughness_map, fragTexCoord).r;
        metal  = texture(metalness_map, fragTexCoord).r;
    } else {
        // MODALITÀ GUI
        albedo = vec3(0.8, 0.2, 0.2);
        rough  = roughness;
        metal  = metalness;
    }

    float roughClamped = max(rough, 0.05);
    vec3 F0 = mix(vec3(0.04), albedo, metal);

    // 4. EQUAZIONE DI COOK-TORRANCE (Illuminazione Diretta)
    vec3 Lo = vec3(0.0);

    if (NdotL > 0.0) {
        vec3  F = fresnelSchlick(VdotH, F0);
        float D = DistributionGGX(N, H, roughClamped);
        float G = GeometrySmith(N, V, L, roughClamped);

        float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL;
        vec3 specular = (D * G * F) / max(denominator, 0.001);

        vec3 kS = F;
        vec3 kD = (vec3(1.0) - kS) * (1.0 - metal);

        vec3 radiance = vec3(1.0) * 10.0;
        Lo = (kD * albedo / PI + specular) * radiance * NdotL;
    }

    // -------------------------------------------------------------------------
    // 5. IMAGE-BASED LIGHTING (Illuminazione Indiretta Ambientale)
    // -------------------------------------------------------------------------

    vec3 F_ambient = fresnelSchlick(max(dot(N, V), 0.0), F0);
    vec3 kS_ambient = F_ambient;
    vec3 kD_ambient = (vec3(1.0) - kS_ambient) * (1.0 - metal);

    // 5.1 IBL Diffuso (Irradianza)
    vec3 worldNormal = normalize(mat3(inverse(view)) * N);
    vec3 irradiance = texture(diffuse_map, worldNormal).rgb;
    vec3 ambient_diffuse = kD_ambient * irradiance * albedo;

    // 5.2 IBL Speculare (Prefilter + BRDF Matematica)
    vec3 R = reflect(-V, N);
    vec3 worldR = normalize(mat3(inverse(view)) * R);
    vec3 prefilteredColor = textureLod(specular_map, worldR, roughClamped * MAX_REFLECTION_LOD).rgb;

    // Integrazione BRDF Analitica (Sostituisce la texture brdf_lut)
    float NdotV_clamped = max(dot(N, V), 0.0);
    vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
    vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
    vec4 r = roughClamped * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NdotV_clamped)) * r.x + r.y;
    vec2 envBRDF = vec2(-1.04, 1.04) * a004 + r.zw;

    // Split-Sum Approximation
    vec3 ambient_specular = prefilteredColor * (F0 * envBRDF.x + envBRDF.y);

    // 5.3 Ambiente Totale
    vec3 ambient = ambient_diffuse + ambient_specular;
    // -------------------------------------------------------------------------

    // 6. ILLUMINAZIONE FINALE E GAMMA CORRECTION
    vec3 color = ambient + Lo;

    // Ritorno allo spazio sRGB per il monitor
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}