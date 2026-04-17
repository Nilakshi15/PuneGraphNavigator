// PUNEMAP - C++ Logic (Academic Version)
// Shows the Data Structures and Algorithms behind the web app

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <limits>
#include <algorithm>
#include <memory>
#include <iomanip>

using namespace std;


// Basic building blocks: a map node (intersection / landmark)
// and a road edge connecting two nodes


struct Node {
    string id;
    string name;
    double x, y;
};

struct Edge {
    string from;
    string to;
    double weight;   // distance in km
};

// Same data that lives in app.js nodes[] and edges[]
// Pune locations with normalized coordinates for visualization
const vector<Node> nodes = {
    {"P1", "Shaniwar Wada",    180, 200},
    {"P2", "FC Road Market",   220, 150},
    {"P3", "Hinjewadi Tech",   350, 180},
    {"P4", "Railway Station",  240, 280},
    {"P5", "IITM Pashan",      280, 120},
    {"P6", "Pune Airport",     400, 250}
};

const vector<Edge> edges = {
    {"P1", "P2", 3},    
    {"P1", "P4", 5},   
    {"P2", "P5", 8},   
    {"P2", "P3", 15},   
    {"P3", "P6", 12},  
    {"P4", "P6", 10},   
    {"P5", "P3", 10},  
    {"P4", "P5", 12},   
    {"P1", "P5", 14}    
};


// Graph - adjacency list representation (undirected)


class Graph {
public:
    unordered_map<string, vector<pair<string, double>>> adj;

    void addEdge(const string& u, const string& v, double w) {
        adj[u].push_back(make_pair(v, w));
        adj[v].push_back(make_pair(u, w));   // road goes both ways
    }

    void print() const {
        cout << "\n=== Road Network (Adjacency List) ===\n";

        unordered_map<string, vector<pair<string, double>>>::const_iterator it;
        for (it = adj.begin(); it != adj.end(); ++it) {
            cout << it->first << " --> ";

            for (int i = 0; i < (int)it->second.size(); i++) {
                cout << it->second[i].first
                     << "(" << it->second[i].second << "km)  ";
            }
            cout << "\n";
        }
    }
};


// Dijkstra's shortest path


struct DijkstraResult {
    unordered_map<string, double> dist;
    unordered_map<string, string> prev;
};

DijkstraResult dijkstra(const Graph& g, const string& src) {
    DijkstraResult res;

    // Start every distance at infinity
    for (int i = 0; i < (int)nodes.size(); i++) {
        res.dist[nodes[i].id] = numeric_limits<double>::infinity();
    }
    res.dist[src] = 0.0;

    // min-heap: (distance, nodeId)
    priority_queue<pair<double, string>,
                   vector<pair<double, string>>,
                   greater<pair<double, string>>> pq;
    pq.push(make_pair(0.0, src));

    while (!pq.empty()) {
        double d = pq.top().first;
        string u = pq.top().second;
        pq.pop();

        // Skip if we already found a better path
        if (d > res.dist[u]) continue;
        if (g.adj.find(u) == g.adj.end()) continue;

        const vector<pair<string, double>>& neighbours = g.adj.at(u);
        for (int i = 0; i < (int)neighbours.size(); i++) {
            string v = neighbours[i].first;
            double w = neighbours[i].second;

            double newDist = res.dist[u] + w;
            if (newDist < res.dist[v]) {
                res.dist[v] = newDist;
                res.prev[v]  = u;
                pq.push(make_pair(newDist, v));
            }
        }
    }
    return res;
}

// Walk backwards through 'prev' pointers to reconstruct the route
vector<string> getPath(const DijkstraResult& res,
                        const string& src,
                        const string& dst) {
    vector<string> path;
    string cur = dst;

    while (cur != src) {
        path.push_back(cur);
        if (res.prev.find(cur) == res.prev.end()) return vector<string>(); // no route
        cur = res.prev.at(cur);
    }
    path.push_back(src);
    reverse(path.begin(), path.end());
    return path;
}


// Zone Tree - N-ary tree that mirrors the city hierarchy


struct ZoneNode {
    string id, name, type;
    vector<shared_ptr<ZoneNode>> children;

    ZoneNode(const string& id_,
             const string& name_,
             const string& type_,
             vector<shared_ptr<ZoneNode>> ch = vector<shared_ptr<ZoneNode>>())
        : id(id_), name(name_), type(type_), children(ch) {}
};

shared_ptr<ZoneNode> buildZoneTree() {
    shared_ptr<ZoneNode> city = make_shared<ZoneNode>("PUNE01", "Pune City", "City");

    // --- Central Zone ---
    shared_ptr<ZoneNode> dst1 = make_shared<ZoneNode>("ZONE01", "Central Pune", "Zone");
    shared_ptr<ZoneNode> ar1  = make_shared<ZoneNode>("AREA01",  "Historic Quarter",      "Area");
    ar1->children.push_back(make_shared<ZoneNode>("LOC01", "Shaniwar Wada",   "Location"));
    ar1->children.push_back(make_shared<ZoneNode>("LOC02", "FC Road Market", "Location"));

    shared_ptr<ZoneNode> ar2 = make_shared<ZoneNode>("AREA02", "Railway Area", "Area");
    ar2->children.push_back(make_shared<ZoneNode>("LOC03", "Railway Station", "Location"));

    dst1->children.push_back(ar1);
    dst1->children.push_back(ar2);

    // --- Tech & Airport Zone ---
    shared_ptr<ZoneNode> dst2 = make_shared<ZoneNode>("ZONE02", "Tech & Airport", "Zone");
    shared_ptr<ZoneNode> ar3 = make_shared<ZoneNode>("AREA03", "IT Parks", "Area");
    ar3->children.push_back(make_shared<ZoneNode>("LOC04", "Hinjewadi Tech", "Location"));
    ar3->children.push_back(make_shared<ZoneNode>("LOC05", "IITM Pashan", "Location"));
    
    shared_ptr<ZoneNode> ar4 = make_shared<ZoneNode>("AREA04", "Airport Region", "Area");
    ar4->children.push_back(make_shared<ZoneNode>("LOC06", "Pune Airport", "Location"));

    dst2->children.push_back(ar3);
    dst2->children.push_back(ar4);

    city->children.push_back(dst1);
    city->children.push_back(dst2);
    return city;
}

// Recursive DFS tree printer
void printTree(const shared_ptr<ZoneNode>& node, int depth = 0) {
    string indent(depth * 4, ' ');
    string prefix = (depth == 0) ? ">> "
                  : node->children.empty() ? "   L- "
                  : "   +- ";

    cout << indent << prefix
         << "[" << node->type << "] " << node->name << "\n";

    for (int i = 0; i < (int)node->children.size(); i++) {
        printTree(node->children[i], depth + 1);
    }
}


// Location / landmark data (mirrors index.html)


struct Location {
    string name, category, address;
    double lat, lng, rating;
    int reviews;
};

const vector<Location> landmarks = {
    {"Shaniwar Wada",              "Historic Fort",   "Shaniwar Peth, Pune",  18.5195, 73.8553, 4.4, 52840},
    {"Aga Khan Palace",            "Monument",        "Yerwada, Pune",        18.5524, 73.9011, 4.5, 41230},
    {"Sinhagad Fort",              "Hill Fort",       "Sinhagad, Pune",       18.3662, 73.7552, 4.6, 38920},
    {"Dagdusheth Ganpati",         "Temple",          "Budhwar Peth, Pune",   18.5163, 73.8567, 4.8, 67890},
    {"Savitribai Phule University","University",      "Ganeshkhind, Pune",    18.5590, 73.8089, 4.4, 23450},
    {"Fergusson College",          "College",         "FC Road, Pune",        18.5227, 73.8407, 4.5, 18760},
    {"Phoenix Marketcity",         "Shopping Mall",   "Viman Nagar, Pune",    18.5598, 73.9231, 4.4, 87650},
    {"Pune Railway Station",       "Railway Station", "Railway Station Rd",   18.5284, 73.8742, 3.8, 54320},
    {"Hinjewadi IT Park",          "IT Park",         "Hinjewadi, Pune",      18.5912, 73.7380, 4.1,  8920},
    {"Ruby Hall Clinic",           "Hospital",        "Sassoon Road, Pune",   18.5286, 73.8796, 4.2, 23450}
};

// Basic substring search - same autocomplete logic as the web app
vector<Location> search(const string& query) {
    string q = query;
    transform(q.begin(), q.end(), q.begin(), ::tolower);

    vector<Location> results;
    for (int i = 0; i < (int)landmarks.size(); i++) {
        string name = landmarks[i].name;
        transform(name.begin(), name.end(), name.begin(), ::tolower);

        if (name.find(q) != string::npos) {
            results.push_back(landmarks[i]);
        }
        if (results.size() >= 5) break;
    }
    return results;
}


// Vehicle type changes travel time estimate


enum Vehicle { NORMAL, EMERGENCY };

double travelTime(double km, Vehicle v) {
    double mins = (km / 40.0) * 60.0;  // assume avg speed of 40 km/h
    if (v == EMERGENCY) mins -= 5;      // priority lane saves ~5 mins
    return mins;
}

// Helper: get human-readable name from a node id
string nodeName(const string& id) {
    for (int i = 0; i < (int)nodes.size(); i++) {
        if (nodes[i].id == id) return nodes[i].name;
    }
    return "?";
}

void printRoute(const vector<string>& path, double dist, Vehicle v) {
    if (path.empty()) {
        cout << "  No path found.\n";
        return;
    }

    cout << "  Route: ";
    for (int i = 0; i < (int)path.size(); i++) {
        cout << nodeName(path[i]);
        if (i + 1 < (int)path.size()) cout << " -> ";
    }

    cout << fixed << setprecision(1);
    cout << "\n  Distance: " << dist << " km";
    cout << "  |  Time: "   << travelTime(dist, v) << " mins";
    if (v == EMERGENCY) cout << "  [Emergency]";
    cout << "\n";
}

// Main


int main() {
    cout << "=== PUNEMAP - C++ Backend Logic ===\n\n";

    // Build the road graph from the edge list
    Graph g;
    for (int i = 0; i < (int)edges.size(); i++) {
        g.addEdge(edges[i].from, edges[i].to, edges[i].weight);
    }
    g.print();

    // Run Dijkstra from Shaniwar Wada
    cout << "\n--- Shortest distances from Shaniwar Wada (P1) ---\n";
    DijkstraResult r = dijkstra(g, "P1");

    for (int i = 0; i < (int)nodes.size(); i++) {
        cout << "  P1 -> " << nodes[i].name
             << ": " << r.dist[nodes[i].id] << " km\n";
    }

    // Sample routes showing routing between Pune landmarks
    cout << "\n--- Route Finding ---\n";

    cout << "[Normal]    Shaniwar Wada (P1) -> Pune Airport (P6):\n";
    printRoute(getPath(r, "P1", "P6"), r.dist["P6"], NORMAL);

    cout << "[Normal]    FC Road (P2) -> Hinjewadi Tech (P3):\n";
    DijkstraResult r2 = dijkstra(g, "P2");
    printRoute(getPath(r2, "P2", "P3"), r2.dist["P3"], NORMAL);

    DijkstraResult rE = dijkstra(g, "P5");
    cout << "[Emergency] IITM Pashan (P5) -> Railway Station (P4):\n";
    printRoute(getPath(rE, "P5", "P4"), rE.dist["P4"], EMERGENCY);

    // Print the zone hierarchy
    cout << "\n--- Zone Hierarchy Tree ---\n";
    printTree(buildZoneTree());

    // Quick landmark search
    cout << "\n--- Search: 'fort' ---\n";
    vector<Location> found = search("fort");
    for (int i = 0; i < (int)found.size(); i++) {
        cout << "  " << found[i].name
             << " | " << found[i].category
             << " | Rating: " << found[i].rating << "\n";
    }

    return 0;
}