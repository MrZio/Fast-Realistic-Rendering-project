#version 330

in vec3 fragPos;
in vec3 fragNormal;
in vec2 fragTexCoord;

out vec4 frag_color;

uniform mat4 view;

// Parametri
uniform vec3 light;      // Posizione/Direzione della luce (1, 1, 1)
uniform vec3 fresnel;    // Il valore F0 (riflettanza a incidenza zero)
uniform float roughness;
uniform float metalness;

// Texture Maps
uniform sampler2D color_map;

const float PI = 3.14159265359;
// Calcola la proporzione di luce riflessa
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    // clamp(..., 0.0, 1.0) evita errori matematici dovuti a float imprecisi
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Calcola quante microfaccette sono allineate correttamente (per le superfici ruvide)
float DistributionGGX(vec3 N, vec3 H, float a) {
    float a2     = a * a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float nom    = a2;
    float denom  = (NdotH2 * (a2 - 1.0) + 1.0);
    denom        = PI * denom * denom;

    return nom / max(denom, 0.0000001); // max evita la divisione per zero!
}
float CheapGeometry(vec3 N, vec3 L, vec3 V) {
    // Calcoliamo i due prodotti scalari (n·l) e (n·v)
    // Usiamo max(..., 0.0) per evitare valori negativi se la luce arriva da dietro
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);

    return NdotL * NdotV;
}

void main(void) {
    // 1. Preparazione dei Vettori Fondamentali
    vec3 N = normalize(fragNormal);

    // Troviamo la posizione della telecamera nel World Space invertendo la View Matrix
    vec3 camPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 V = normalize(camPos - fragPos);

    // Dal tuo glwidget.cc la "light" passata è un vettore vec3(1,1,1)
    vec3 L = normalize(light);

    // Half-vector: a metà strada tra la telecamera e la luce
    vec3 H = normalize(V + L);

    // 2. Lettura dei Materiali
    vec3 albedo = texture(color_map, fragTexCoord).rgb;
    // F0 arriva dai tuoi 3 spinbox "F0 R, G, B" nell'interfaccia!
    vec3 F0 = fresnel;

    // 3. Calcolo dell'Equazione Cook-Torrance
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
        float D = DistributionGGX(N, H, max(roughness, 0.05));

        // --- CHEAP OPTION ---
        // Avendo scelto l'approssimazione G = (NdotL)(NdotV), la funzione
        // geometrica si elide perfettamente con il denominatore originale.
        // L'intera componente speculare si riduce alla moltiplicazione D * F divisa per 4.
        // Niente calcolo di k, niente funzione G, niente denominatore lungo!

        vec3 specular = (D * F) / 4.0;

    // 4. Calcolo della componente Diffusa (Conservazione dell'energia)
    vec3 kS = F;                 // Tutta l'energia riflessa
    vec3 kD = vec3(1.0) - kS;    // L'energia rimanente entra nell'oggetto...
    kD *= 1.0 - metalness;       // ...ma i metalli non hanno luce diffusa!

    // Radiosità totale in uscita
    float NdotL = max(dot(N, L), 0.0);
    vec3 radiance = vec3(1.0);   // Assumiamo una luce bianca di intensità 1.0

    // L'equazione di rendering finale!
    vec3 color = (kD * albedo / PI + specular) * radiance * NdotL;

    // (Opzionale) Gamma Correction per i monitor standard (sRGB)
    color = pow(color, vec3(1.0/2.2));

    frag_color = vec4(color, 1.0);
}
