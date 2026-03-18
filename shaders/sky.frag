#version 330

in vec3 texCoords;

out vec4 frag_color;

uniform samplerCube specular_map;

void main (void) {
    frag_color = texture(specular_map, texCoords);
}
