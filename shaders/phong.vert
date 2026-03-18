#version 330

layout (location = 0) in vec3 vert;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat3 normal_matrix;


out vec3 fragPos;
out vec3 fragNormal;

void main(void)  {

gl_Position = projection* view* model * vec4(vert, 1.0);
fragNormal = normalize(normal_matrix * normal );
fragPos = vec3(model * vec4(vert, 1.0));
}
