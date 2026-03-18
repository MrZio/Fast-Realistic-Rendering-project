#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

// Passiamo al Fragment Shader i dati grezzi, non calcolati!
out vec3 fragWorldPos;
out vec3 fragWorldNormal;

void main(void)  {
    gl_Position = projection * view * model * vec4(vert, 1.0);

    // Trasformazione in World Space
    fragWorldPos = vec3(model * vec4(vert, 1.0));

    // Usiamo l'inversa trasposta per la normale
    fragWorldNormal = normalize(mat3(transpose(inverse(model))) * normal);
}