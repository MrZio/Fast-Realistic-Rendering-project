#version 330

out vec4 frag_color;

in vec3 fragWorldPos;
in vec3 fragWorldNormal;

// Dobbiamo ricevere la view matrix qui per trovare la telecamera!
uniform mat4 view;
uniform samplerCube specular_map;

void main (void) {
    // 1. Assicuriamoci che la normale interpolata sia di lunghezza 1
    vec3 N = normalize(fragWorldNormal);

    // 2. Troviamo la telecamera nel World Space
    vec3 cameraPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));

    // 3. Calcoliamo il vettore Incidente (V) per questo esatto pixel
    vec3 I = normalize(fragWorldPos - cameraPos);

    // 4. Calcoliamo il vettore Riflesso (R) per questo esatto pixel
    vec3 R = reflect(I, N);

    // 5. Leggiamo la Skybox
    frag_color = texture(specular_map, R);
}