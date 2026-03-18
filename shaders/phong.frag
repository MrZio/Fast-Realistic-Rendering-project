#version 330

// Parametri in ingresso dal C++
uniform vec3 light;
uniform mat4 view; // Aggiungiamo la matrice view per trovare la telecamera!

out vec4 frag_color;

in vec3 fragPos;
in vec3 fragNormal;

void main (void) {
    // Colori/Materiali di base (puoi passarli come uniform se vuoi)
    vec3 objectColor = vec3(0.8, 0.2, 0.2);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    // 1. Vettori Fondamentali
    vec3 norm = normalize(fragNormal);
    vec3 lightDir = normalize(light - fragPos);

    // Troviamo la posizione della telecamera estraendola dalla View Matrix
    vec3 camPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 viewDir = normalize(camPos - fragPos); // Vettore V (Vista)

    // 2. Componente AMBIENTE
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;

    // 3. Componente DIFFUSA (Legge di Lambert)
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // 4. Componente SPECULARE (Modello di Phong)
    float specularStrength = 0.5; // K_s
    float shininess = 32.0; // s (esponente che definisce quanto è concentrato il riflesso)

    // In GLSL la funzione reflect richiede il vettore incidente (dalla luce verso il punto),
    // quindi usiamo -lightDir.
    vec3 reflectDir = reflect(-lightDir, norm); // Vettore R (Riflesso)

    // Calcolo (R dot V)^s
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;

    // 5. Risultato Finale: Equazione di Phong Completa (Ambiente + Diffusa + Speculare)
    vec3 result = (ambient + diffuse + specular) * objectColor;

    frag_color = vec4(result, 1.0);
}