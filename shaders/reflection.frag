#version 330

out vec4 frag_color;

in vec3 R;

uniform samplerCube specular_map;

void main (void) {
    frag_color = texture(specular_map, R);
}
