#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

// Invieremo il vettore riflesso calcolato al Fragment Shader
out vec3 R;

void main(void)  {
        gl_Position = projection * view * model * vec4(vert, 1.0);


        // Usiamo l'inversa trasposta per le normali per evitare distorsioni in caso di scaling
        vec3 worldPos = vec3(model * vec4(vert, 1.0));
        vec3 worldNormal = normalize(mat3(transpose(inverse(model))) * normal);


        // Moltiplicando per l'inversa della matrice di vista, troviamo le sue coordinate assolute.
        vec3 cameraPos = vec3(inverse(view) * vec4(0.0, 0.0, 0.0, 1.0));

        // 4. Calcoliamo il vettore Incidente (Dalla telecamera al vertice)
        vec3 I = normalize(worldPos - cameraPos);

        // 5. Calcoliamo il rimbalzo
        R = reflect(I, worldNormal);
}
