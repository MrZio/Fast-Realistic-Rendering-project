#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat3 normal_matrix;  // calcolata dal C++ come transpose(inverse(view*model)) → VIEW space

out vec3 fragPos;      // VIEW space
out vec3 fragNormal;   // VIEW space
out vec2 fragTexCoord;

void main(void) {
    gl_Position  = projection * view * model * vec4(vert, 1.0);

    // fragPos in VIEW space (coerente con normal_matrix del C++)
    fragPos      = vec3(view * model * vec4(vert, 1.0));

    // normal_matrix trasforma da object space a VIEW space
    fragNormal   = normalize(normal_matrix * normal);

    fragTexCoord = texCoord;
}
