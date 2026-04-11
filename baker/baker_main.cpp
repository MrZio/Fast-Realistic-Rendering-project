#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

#include <glm/glm.hpp>
#include <glm/gtc/constants.hpp>
#include <cmath>
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

//  passare le 6 immagini
struct CubeMap {
    unsigned char* data[6];
    int width, height, channels;
};

// Funzione che converte una direzione 3D nel colore RGB letto dalle immagini
glm::vec3 sampleCubeMap(const CubeMap& cube, glm::vec3 v) {
    float absX = std::abs(v.x), absY = std::abs(v.y), absZ = std::abs(v.z);
    int faceIndex = 0;
    float sc = 0.0f, tc = 0.0f, ma = 0.0f;

    // Determina in base all'asse maggiore
    if (absX >= absY && absX >= absZ) {
        faceIndex = (v.x > 0) ? 0 : 1; // +X o -X
        ma = absX;
        sc = (v.x > 0) ? -v.z : v.z;
        tc = -v.y;
    } else if (absY >= absX && absY >= absZ) {
        faceIndex = (v.y > 0) ? 2 : 3; // +Y o -Y
        ma = absY;
        sc = v.x;
        tc = (v.y > 0) ? v.z : -v.z;
    } else {
        faceIndex = (v.z > 0) ? 4 : 5; // +Z o -Z
        ma = absZ;
        sc = (v.z > 0) ? v.x : -v.x;
        tc = -v.y;
    }

    // Converti in coordinate UV 
    float u = (sc / ma + 1.0f) * 0.5f;
    float v_coord = (tc / ma + 1.0f) * 0.5f;

    // Converti in coordinate Pixel
    int x = std::max(0, std::min((int)(u * cube.width), cube.width - 1));
    int y = std::max(0, std::min((int)(v_coord * cube.height), cube.height - 1));

    int pixelOffset = (y * cube.width + x) * cube.channels;

    // Ritorna il colore normalizzato tra 0.0 e 1.0
    return glm::vec3(
        cube.data[faceIndex][pixelOffset] / 255.0f,
        cube.data[faceIndex][pixelOffset + 1] / 255.0f,
        cube.data[faceIndex][pixelOffset + 2] / 255.0f
        );
}

glm::vec3 computeIrradiance(const CubeMap& cube, glm::vec3 N) {
    glm::vec3 irradiance(0.0f);

    // 1. Matrice TBN (La "Gabbia" per ruotare i raggi)
    glm::vec3 up = (std::abs(N.y) < 0.999f) ? glm::vec3(0.0f, 1.0f, 0.0f) : glm::vec3(0.0f, 0.0f, 1.0f);
    glm::vec3 right = glm::normalize(glm::cross(up, N));
    up = glm::normalize(glm::cross(N, right));

    // 2. Impostazioni dello scanner
    float sampleDelta = 0.05f;
    float nrSamples = 0.0f;

    // 3. I due cicli angolari 
    for (float phi = 0.0f; phi < 2.0f * glm::pi<float>(); phi += sampleDelta) {
        for (float theta = 0.0f; theta < 0.5f * glm::pi<float>(); theta += sampleDelta) {
            // Genera il raggio "dritto" (Spazio Tangente)
            glm::vec3 tangentSample(std::sin(theta) * std::cos(phi), std::sin(theta) * std::sin(phi), std::cos(theta));

            // Ruota il raggio nella direzione giusta (Spazio Mondo)
            glm::vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N;

            // Leggi il colore e applica la legge di Lambert e la compensazione sferica
            glm::vec3 color = sampleCubeMap(cube, sampleVec);
            irradiance += color * std::cos(theta) * std::sin(theta);
            nrSamples++;
        }
    }

    // 4. Media finale
    irradiance = glm::pi<float>() * irradiance * (1.0f / nrSamples);
    return irradiance;
}

int main() {
    std::cout << "Start CubeMap Baker..." << std::endl;

    std::vector<std::string> faceFiles = {
        "posx.jpg", "negx.jpg",
        "posy.jpg", "negy.jpg",
        "posz.jpg", "negz.jpg"
    };

    unsigned char* faceData[6];
    int width, height, originalChannels;

    // 1. CARICHIAMO LE 6 IMMAGINI
    bool success = true;
    for (int i = 0; i < 6; ++i) {
        // Forziamo 3 canali (RGB)
        faceData[i] = stbi_load(faceFiles[i].c_str(), &width, &height, &originalChannels, 3);

        if (!faceData[i]) {
            std::cerr << "Errore: impossibile caricare " << faceFiles[i] << std::endl;
            success = false;
        } else {
            std::cout << "Caricata " << faceFiles[i] << " (" << width << "x" << height << ")" << std::endl;
        }
    }

    if (!success) return -1;

    //  BAKING 
    std::cout << "Inizio il calcolo dell'Irradianza Diffusa. Potrebbe volerci un po'..." << std::endl;

    CubeMap skybox;
    skybox.width = width;
    skybox.height = height;
    skybox.channels = 3; // dobbiamo dire che i canali sono 3!
    for(int i = 0; i < 6; i++) skybox.data[i] = faceData[i];

    const int outSize = 64;
    std::vector<std::string> outNames = {
        "irradiance_posx.png", "irradiance_negx.png",
        "irradiance_posy.png", "irradiance_negy.png",
        "irradiance_posz.png", "irradiance_negz.png"
    };

    for (int face = 0; face < 6; ++face) {
        std::cout << "Calcolo faccia " << face + 1 << "/6..." << std::endl;
        unsigned char* outData = new unsigned char[outSize * outSize * 3];

        for (int y = 0; y < outSize; ++y) {
            for (int x = 0; x < outSize; ++x) {
                float u = ((float)x + 0.5f) / outSize * 2.0f - 1.0f;
                float v = ((float)y + 0.5f) / outSize * 2.0f - 1.0f;

                glm::vec3 N(0.0f);
                if (face == 0) N = glm::vec3(1.0f, -v, -u);
                else if (face == 1) N = glm::vec3(-1.0f, -v, u);
                else if (face == 2) N = glm::vec3(u, 1.0f, v);
                else if (face == 3) N = glm::vec3(u, -1.0f, -v);
                else if (face == 4) N = glm::vec3(u, -v, 1.0f);
                else if (face == 5) N = glm::vec3(-u, -v, -1.0f);

                N = glm::normalize(N);
                glm::vec3 pixelColor = computeIrradiance(skybox, N);

                int offset = (y * outSize + x) * 3;
                outData[offset]     = std::max(0, std::min((int)(pixelColor.r * 255.0f), 255));
                outData[offset + 1] = std::max(0, std::min((int)(pixelColor.g * 255.0f), 255));
                outData[offset + 2] = std::max(0, std::min((int)(pixelColor.b * 255.0f), 255));
            }
        }

        stbi_write_png(outNames[face].c_str(), outSize, outSize, 3, outData, outSize * 3);
        delete[] outData;
    }

    std::cout << "Baking completato con successo! Nuove immagini salvate." << std::endl;

    for (int i = 0; i < 6; ++i) {
        if (faceData[i]) stbi_image_free(faceData[i]);
    }

    return 0;
}