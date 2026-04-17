# 🚦 PuneGraphNavigator

PuneGraphNavigator is a graph-based smart navigation system designed for Pune city.
It focuses on efficient route optimization and zone-based city management using core Data Structures and Algorithms.

---

## 🔍 Project Overview

This project models Pune as a graph where:

* Nodes represent locations or junctions
* Edges represent roads with weights (distance/traffic)

It computes the shortest path between locations using Dijkstra’s Algorithm and also supports zone-based traversal for better city management.

---

## ⚙️ Features

* Shortest path calculation between locations
* Graph-based city representation
* Zone-wise organization of locations
* Efficient traversal using BFS
* Clean UI with right-side control panel (no overlap with map)

---

## 🧠 Data Structures Used

| Data Structure                             | Used In              | Why Chosen                                       |
| ------------------------------------------ | -------------------- | ------------------------------------------------ |
| Adjacency List (`unordered_map + vector`)  | Graph Construction   | Efficient for sparse graphs, O(V+E) space        |
| Min-Heap Priority Queue                    | Dijkstra’s Algorithm | Quickly selects minimum distance node (O(log V)) |
| Arrays (`dist[]`, `visited[]`, `parent[]`) | Dijkstra’s Algorithm | Fast O(1) access for tracking                    |
| N-ary Tree                                 | Zone Management      | Suitable for hierarchical city zones             |
| Queue                                      | BFS Traversal        | Enables level-order traversal                    |

---

## 🔄 Algorithms Used

* Dijkstra’s Algorithm (Shortest Path)
* Breadth First Search (BFS)

---

## 🛠️ Technologies

* C++
* Data Structures & Algorithms
* Graph Theory

---

## 🎯 Objective

To design an efficient and scalable navigation system that reduces travel time and improves route planning in Pune city.

---

## 💡 Innovation

* Combines graph algorithms with zone-based city modeling
* Focuses specifically on Pune instead of generic maps
* Organized UI to ensure clear visualization without overlap

---

## ▶️ How to Run

1. Open the project folder
2. Run the main C++ file OR open `index.html` (for UI)
3. Select source and destination to view optimized route

---

## 📌 Note

For detailed UI/UX explanation, refer to `walkthrough.md`.
