#version 330

uniform vec3 light;


out vec4 frag_color;

in vec3 fragPos;
in vec3 fragNormal;

void main (void) {

    vec3 norm = normalize(fragNormal);
    vec3 lightDir = normalize(light - fragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 result = (0.1 + diff) * vec3(0.8, 0.2, 0.2);

    frag_color = vec4(result, 1.0);

}
