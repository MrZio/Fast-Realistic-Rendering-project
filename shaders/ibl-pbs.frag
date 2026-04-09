#version 330

in vec3 fragPos;      // Passato dal Vertex Shader in VIEW space
in vec3 fragNormal;   // Passato dal Vertex Shader in VIEW space
in vec2 fragTexCoord;

out vec4 frag_color;

const float MAX_REFLECTION_LOD = 4.0;
uniform mat4 view;

// IBL Maps
uniform samplerCube irradiance_map;
uniform samplerCube prefilter_map;
uniform sampler2D   brdf_lut;

// Parametri C++
uniform vec3  light;      // Posizione della luce in WORLD space
uniform vec3  fresnel;    // Slider UI
uniform float roughness;  // Slider UI per la ruvidità globale
uniform float metalness;  // Slider UI per la metallicità globale

// L'interruttore del C++: 0 = Slider GUI, 1 = Texture
uniform int use_texture;

// Texture del materiale
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

    // In View Space, la telecamera è all'origine (0,0,0)
    vec3 V = normalize(-fragPos);

    // Convertiamo la posizione della luce da World Space a View Space
    vec3 lightPosView = vec3(view * vec4(light, 1.0));
    vec3 L = normalize(lightPosView - fragPos); // Faretto (Point Light)

    vec3 H = normalize(V + L);

    float NdotL = max(dot(N, L), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // 2. LOGICA DEI MATERIALI (Bivio UI vs Texture)
    vec3 albedo;
    float rough;
    float metal;

    if (use_texture == 1) {
        // MODALITÀ TEXTURE
        albedo = texture(color_map, fragTexCoord).rgb;
        albedo = pow(albedo, vec3(2.2)); // De-gamma: Spazio Lineare per la corretta fisica

        rough  = texture(roughness_map, fragTexCoord).r;
        metal  = texture(metalness_map, fragTexCoord).r;
    } else {
        // MODALITÀ GUI
        albedo = vec3(0.8, 0.2, 0.2); // Rosso fisso per testare correttamente i dielettrici
        rough  = roughness;
        metal  = metalness;
    }

    // Clamp minimo per la roughness (evita artefatti e divisioni per zero)
    float roughClamped = max(rough, 0.05);

    // 3. RIFLETTANZA DI BASE (F0)
    // 0.04 per i dielettrici, colore base (albedo) per i metalli
    vec3 F0 = mix(vec3(0.04), albedo, metal);

    // 4. EQUAZIONE DI COOK-TORRANCE (Illuminazione Diretta)
        vec3 Lo = vec3(0.0); // Di base, nessuna luce diretta

        // Calcoliamo la luce diretta SOLO se il pixel "vede" il faretto
        if (NdotL > 0.0) {
            vec3  F = fresnelSchlick(VdotH, F0);
            float D = DistributionGGX(N, H, roughClamped);
            float G = GeometrySmith(N, V, L, roughClamped);

            // Denominatore protetto
            float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL;
            vec3 specular = (D * G * F) / max(denominator, 0.001);

            vec3 kS = F;
            vec3 kD = (vec3(1.0) - kS) * (1.0 - metal);

            // Aggiungiamo l'energia alla luce in uscita (Lo)
            vec3 radiance = vec3(0.0) * 10.0; // Intensità faretto
            Lo = (kD * albedo / PI + specular) * radiance * NdotL;
        }
        // -------------------------------------------------------------------------
            // 5. IMAGE-BASED LIGHTING (Illuminazione Indiretta Ambientale)
            // -------------------------------------------------------------------------

            // Calcoliamo il Fresnel specifico per l'ambiente (basato sull'angolo di vista NdotV, non sulla lampadina)
            vec3 F_ambient = fresnelSchlick(max(dot(N, V), 0.0), F0);
            vec3 kS_ambient = F_ambient;
            // L'energia che non viene riflessa (kS) viene assorbita per la diffusione (kD)
            vec3 kD_ambient = (vec3(1.0) - kS_ambient) * (1.0 - metal);

            // 5.1 IBL Diffuso (Irradianza)
            vec3 worldNormal = normalize(mat3(inverse(view)) * N);
            vec3 irradiance = texture(irradiance_map, worldNormal).rgb;
            // Usiamo il nostro nuovo kD ambientale!
            vec3 ambient_diffuse = kD_ambient * irradiance * albedo;

            // 5.2 IBL Speculare (Prefilter + BRDF LUT)
            // Calcoliamo il vettore di riflessione in View Space e lo portiamo in World Space
            vec3 R = reflect(-V, N);
            vec3 worldR = normalize(mat3(inverse(view)) * R);

            // Leggiamo il cielo sfocato in base alla rugosità
            vec3 prefilteredColor = textureLod(prefilter_map, worldR, roughClamped * MAX_REFLECTION_LOD).rgb;

            // Leggiamo la BRDF LUT usando NdotV e la rugosità
            vec2 envBRDF = texture(brdf_lut, vec2(max(dot(N, V), 0.0), roughClamped)).rg;

            // Split-Sum Approximation per lo speculare ambientale
            vec3 ambient_specular = prefilteredColor * (F0 * envBRDF.x + envBRDF.y);

            // 5.3 Ambiente Totale
            vec3 ambient = ambient_diffuse + ambient_specular;
            // -------------------------------------------------------------------------

    // 6. ILLUMINAZIONE FINALE E GAMMA CORRECTION
    vec3 radiance = vec3(1.0) * 10.0; // Intensità faretto

    // Sommiamo la luce ambientale continua con la luce diretta del faretto
    vec3 color = ambient + Lo;

    // Ritorno allo spazio sRGB per il monitor
    color = pow(color, vec3(1.0 / 2.2));

    frag_color = vec4(color, 1.0);
}