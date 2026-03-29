#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

struct GhostObject {
    int x;
    int y;
    int width;
    int height;
    double velocityX;
    double velocityY;

    GhostObject(int x, int y, int width, int height, double velocityX, double velocityY)
        : x(x), y(y), width(width), height(height), velocityX(velocityX), velocityY(velocityY) {}
};

struct Terrain {
    int x;
    int y;
    int width;
    int height; 
    bool isPlatform;
    Terrain(int x, int y, int width, int height, bool isPlatform)
        : x(x), y(y), width(width), height(height), isPlatform(isPlatform) {}
};

struct Coordinate{
	int x;
	int y;
};

extern "C"{
	EMSCRIPTEN_KEEPALIVE
std::vector<Terrain> createTerrainVectorFromData(float* terrainData, int count){
    std::vector<Terrain> terrainObjects;
    for (int i = 0; i < count; i++) {
        int index = i * 5; // Assuming each terrain object has 5 properties: x, y, width, height, isPlatform
        int x = static_cast<int>(terrainData[index]);
        int y = static_cast<int>(terrainData[index + 1]);
        int width = static_cast<int>(terrainData[index + 2]);
        int height = static_cast<int>(terrainData[index + 3]);
        bool isPlatform = terrainData[index + 4] != 0; // Assuming non-zero means true
        terrainObjects.emplace_back(x, y, width, height, isPlatform);
    }
    return terrainObjects;
}
EMSCRIPTEN_KEEPALIVE
//Next frames ghost position calculation
GhostObject createGhostObject(int x, int y, int width, int height, double velocityX, double velocityY) {
    int calcX = x + width + velocityX;
    int calcY = y + height + velocityY;
    return GhostObject(calcX, calcY, width, height, velocityX, velocityY);
}
EMSCRIPTEN_KEEPALIVE
bool collisionDetection(const GhostObject& ghostObject, const std::vector<Terrain>& terrainObjects){
    bool EvaledCondition = false;
    for (const Terrain& terrain: terrainObjects) {
        if (ghostObject.x < terrain.x + terrain.width &&
            ghostObject.x + ghostObject.width > terrain.x &&
            ghostObject.y < terrain.y + terrain.height &&
            ghostObject.y + ghostObject.height > terrain.y) {
            EvaledCondition = true;
            break;
        }
    }
    return EvaledCondition;
}
enum CollisionDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
};
EMSCRIPTEN_KEEPALIVE
CollisionDirection AABBDetection(const GhostObject& ghostObject, const Terrain& terrain) {
    double ghostCenterX = ghostObject.x + ghostObject.width / 2.0;
    double ghostCenterY = ghostObject.y + ghostObject.height / 2.0;
    double terrainCenterX = terrain.x + terrain.width / 2.0;
    double terrainCenterY = terrain.y + terrain.height / 2.0;

    double deltaX = ghostCenterX - terrainCenterX;
    double deltaY = ghostCenterY - terrainCenterY;

    double combinedHalfWidths = (ghostObject.width + terrain.width) / 2.0;
    double combinedHalfHeights = (ghostObject.height + terrain.height) / 2.0;

    if (std::abs(deltaX) < combinedHalfWidths && std::abs(deltaY) < combinedHalfHeights) {
        double overlapX = combinedHalfWidths - std::abs(deltaX);
        double overlapY = combinedHalfHeights - std::abs(deltaY);

        if (overlapX < overlapY) {
            return (deltaX > 0) ? LEFT : RIGHT;
        } else {
            return (deltaY > 0) ? UP : DOWN;
        }
    }
}
}
