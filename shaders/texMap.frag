#version 330

in vec2 fragTextCoord;


uniform sampler2D color_map;
uniform sampler2D roughness_map;
uniform sampler2D metalness_map;


uniform int current_texture;

out vec4 frag_color;

void main(void) {
    if (current_texture == 0) {
        frag_color = texture(color_map, fragTextCoord);
    }
    else if (current_texture == 1) {
        frag_color = texture(roughness_map, fragTextCoord);
    }
    else if (current_texture == 2) {
        frag_color = texture(metalness_map, fragTextCoord);
    }
    else {
        // Colore di sicurezza fucsia nel caso qualcosa vada storto
        frag_color = vec4(1.0, 0.0, 1.0, 1.0);
    }
}
