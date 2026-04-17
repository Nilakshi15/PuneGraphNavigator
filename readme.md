# 🚦 PuneGraphNavigator

🌐 **Live Demo:**
https://pune-graph-navigator.vercel.app

---

## 🔍 Project Overview

PuneGraphNavigator is a smart city-based navigation system designed specifically for Pune.
It models the city as a graph and computes the most efficient routes using Dijkstra’s Algorithm.

* Nodes → Locations / Junctions
* Edges → Roads with weights (distance / traffic)

---

## ⚙️ Features

* 📍 Shortest path calculation between locations
* 🗺️ Graph-based city representation
* 🏙️ Zone-wise organization using tree structure
* 🔄 BFS traversal for zone management
* 🎯 Clean UI with right-side control panel (no overlap with map)
* 🌐 Live deployed project for real-time usage

---

## 🧠 Data Structures Used

| Data Structure                             | Used In              | Why Chosen                             |
| ------------------------------------------ | -------------------- | -------------------------------------- |
| Adjacency List (`unordered_map + vector`)  | Graph Construction   | Efficient for sparse graphs (O(V+E))   |
| Min-Heap Priority Queue                    | Dijkstra’s Algorithm | Fast minimum node selection (O(log V)) |
| Arrays (`dist[]`, `visited[]`, `parent[]`) | Dijkstra’s Algorithm | Constant time access                   |
| N-ary Tree                                 | Zone Management      | Represents hierarchical city zones     |
| Queue                                      | BFS Traversal        | Level-order traversal                  |

---

## 🔄 Algorithms Used

* Dijkstra’s Algorithm (Shortest Path)
* Breadth First Search (BFS)

---

## 🛠️ Technologies

* C++
* HTML, CSS, JavaScript (UI)
* Graph Theory & Data Structures

---

## 🎯 Objective

To develop an efficient and scalable navigation system that reduces travel time and improves route planning in Pune city.

---

## 💡 Innovation

* Combines graph algorithms with zone-based city modeling
* Designed specifically for Pune instead of generic maps
* Ensures clean visualization with zero UI overlap
* Deployed online for real-time interaction

---

## 📸 Preview

*(Add your project screenshot here)*

---

## ▶️ How to Run Locally

1. Clone the repository
2. Open the project folder
3. Run `index.html` in your browser

---

## 📌 Note

For detailed UI/UX explanation, refer to `walkthrough.md`.
