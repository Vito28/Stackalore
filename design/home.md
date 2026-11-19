# FumaDocs — Home Page UI/UX Specification

## Project Overview

FumaDocs adalah website dokumentasi interaktif untuk materi kuliah dan computer science.

Website ini bukan sekadar kumpulan artikel dokumentasi. FumaDocs harus terasa seperti **interactive learning environment** yang menggabungkan:

* Dokumentasi
* Penjelasan konsep
* Visualisasi
* Animasi
* Simulasi
* Code playground
* Interactive diagrams

Saat ini FumaDocs memiliki empat kelompok dokumentasi utama:

1. **Data Structures & Algorithms**
2. **Machine Learning**
3. **Deep Learning**
4. **Cryptography**

Home page harus menjadi pintu masuk utama menuju keempat dokumentasi tersebut.

---

# Tech Stack

Project sudah menggunakan:

* Next.js
* TypeScript
* Fumadocs
* MDX
* Tailwind CSS

Interactive UI dapat menggunakan:

* Motion
* React Flow
* Monaco Editor
* SVG
* Canvas jika benar-benar dibutuhkan

Jangan menambahkan library besar tanpa kebutuhan yang jelas.

---

# Main Design Direction

Buat Home Page dengan gaya:

**Modern, minimal, clean, technical, interactive, premium.**

Referensi suasana:

* Modern developer tools
* Interactive computer science learning platform
* Linear-style simplicity
* Vercel-style whitespace
* Modern technical documentation
* Algorithm visualization websites

Tetapi jangan menyalin desain website tertentu.

Home page harus memiliki identitas sendiri.

---

# Important Design Rules

## Jangan membuat Card Grid biasa

Hindari desain seperti:

```text
┌──────────────┐ ┌──────────────┐
│ Machine      │ │ Deep         │
│ Learning     │ │ Learning     │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Data         │ │ Cryptography │
│ Structures   │ │              │
└──────────────┘ └──────────────┘
```

Jangan membuat home page terlihat seperti template SaaS generik.

Hindari:

* Banyak card rounded besar
* Shadow berlebihan
* Gradient warna-warni
* Hero dengan blob background
* Bento grid generik
* Icon dalam kotak pada setiap section
* Terlalu banyak border
* Terlalu banyak badge
* Background dekoratif yang ramai

Gunakan **white space, typography, hierarchy, garis tipis, motion dan interactive visualization** sebagai elemen desain utama.

---

# Color Direction

## Light Mode

Dominan:

```text
Background        #FFFFFF
Secondary BG      #FAFAFA
Primary Text      #171717
Secondary Text    #737373
Border            #E5E5E5
Muted             #A3A3A3
```

## Dark Mode

Dominan:

```text
Background        #090909
Secondary BG      #111111
Primary Text      #FAFAFA
Secondary Text    #A3A3A3
Border            #262626
Muted             #737373
```

Gunakan warna tambahan hanya pada visualisasi atau state tertentu.

Contoh:

* active node
* selected item
* algorithm comparison
* ML data point
* neural network activation
* encryption process

Jangan menjadikan accent color sebagai warna dominan seluruh website.

---

# Dark / Light Mode

Website wajib mendukung:

* Light mode
* Dark mode
* System preference

Theme transition harus lembut dan tidak berlebihan.

Navbar memiliki theme toggle sederhana.

---

# Navigation

Navbar dibuat sangat sederhana.

Contoh:

```text
FumaDocs

Docs
Explore
Playground
About

Search...       Theme
```

Desktop:

* Logo di kiri
* Navigation di tengah/kiri
* Search dan theme toggle di kanan

Mobile:

* Logo
* Search
* Menu button

Gunakan sticky navbar dengan background semi-transparan dan subtle backdrop blur ketika halaman di-scroll.

Jangan terlalu tinggi.

---

# Hero Section

Hero harus sederhana tetapi kuat.

Contoh arah copy:

```text
FumaDocs

Computer Science,
made visual.

Explore concepts through documentation,
interactive simulations, code and visualization.
```

Alternative:

```text
Learn computer science
by seeing how it works.
```

Subheading:

```text
Interactive notes and experiments covering data structures,
machine learning, deep learning and cryptography.
```

Primary CTA:

```text
Explore Documentation
```

Secondary CTA:

```text
Open Playground →
```

Jangan menggunakan ilustrasi stock.

---

# Hero Interactive Visual

Sisi hero atau bagian bawah hero memiliki **live technical visualization**.

Bukan image statis.

Visualization bisa secara perlahan berganti antara empat domain.

Contoh state pertama:

```text
DATA STRUCTURES

[17] [4] [23] [8] [12]

          ↓

[4] [8] [12] [17] [23]
```

Kemudian transisi menjadi Machine Learning:

```text
MACHINE LEARNING

       •
   •        •
      ╲
       ╲ decision boundary
        ╲
   ○          ○
        ○
```

Kemudian Deep Learning:

```text
DEEP LEARNING

○      ○      ○
 ╲    ╱╲    ╱
  ○──○──○──○
 ╱    ╲╱    ╲
○      ○      ○
```

Kemudian Cryptography:

```text
CRYPTOGRAPHY

HELLO WORLD

      ↓ encryption

A7 F2 91 4C 08 ...

      ↓ decryption

HELLO WORLD
```

Animation harus subtle dan smooth.

Tidak perlu autoplay cepat.

Sekitar 5–8 detik per state.

User juga bisa memilih state menggunakan navigation kecil.

---

# Explore Section

Setelah Hero buat section:

```text
Explore
```

Bukan card grid.

Gunakan **large editorial rows**.

Contoh:

```text
01

Data Structures
& Algorithms

Understand how data is stored,
organized and processed.

Array · Linked List · Stack · Queue
Tree · Graph · Searching · Sorting

Explore Data Structures →
────────────────────────────────────────────
```

Kemudian:

```text
02

Machine Learning

Understand how machines learn
patterns from data.

Regression · Classification · Clustering
Decision Trees · Model Evaluation

Explore Machine Learning →
────────────────────────────────────────────
```

Kemudian:

```text
03

Deep Learning

Explore how neural networks
learn complex representations.

Neural Networks · CNN · RNN
Transformers · Backpropagation

Explore Deep Learning →
────────────────────────────────────────────
```

Dan:

```text
04

Cryptography

Understand how information
can be protected and verified.

Hashing · Symmetric Encryption
Asymmetric Encryption · Digital Signatures

Explore Cryptography →
────────────────────────────────────────────
```

---

# Explore Section Interaction

Setiap row harus memiliki interactive visual kecil di sisi kanan.

## Data Structures

Contoh:

```text
[12] [7] [24] [3] [18]
```

Hover:

```text
compare

[12] [7]
 ↓ swap

[7] [12] [24] [3] [18]
```

---

## Machine Learning

Tampilkan scatter plot sederhana.

Hover membuat:

* beberapa datapoint muncul
* decision boundary bergerak
* label class muncul secara subtle

---

## Deep Learning

Visualisasi neural network.

Hover:

* neuron activation menyebar dari input ke output
* edges berubah opacity
* satu path terlihat aktif

---

## Cryptography

Tampilkan:

```text
FUMADOCS
```

kemudian berubah menjadi:

```text
47 A2 9F 03 D1 ...
```

atau simulasi Caesar Cipher sederhana.

---

# Interactive Learning Section

Tambahkan section setelah Explore:

```text
Don't just read it.
See it happen.
```

Subheading:

```text
Concepts in FumaDocs can be explored step by step
through interactive simulations.
```

Visual besar:

```text
┌──────────────────────────────────────────────┐
│ Bubble Sort                                  │
│                                              │
│  █                                           │
│  █        █                                  │
│  █   █    █                                  │
│  █   █    █        █                         │
│                                              │
│ 40   20   30   10                            │
│                                              │
│ Step 4 / 12                                  │
│                                              │
│ [ Previous ] [ ▶ Play ] [ Next ]             │
└──────────────────────────────────────────────┘
```

Di sebelah atau bawahnya:

```cpp
if (arr[j] > arr[j + 1]) {
    swap(arr[j], arr[j + 1]);
}
```

Baris code aktif mengikuti animation state.

Section ini menunjukkan bahwa FumaDocs bukan dokumentasi statis.

---

# Code Playground Preview

Section berikutnya memperlihatkan playground.

Heading:

```text
Learn by experimenting.
```

Contoh layout:

```text
C++                         Run ▶

#include <iostream>

int main() {
    std::cout << "Hello";
}
────────────────────────────────

Output

Hello
```

Gunakan Monaco Editor hanya ketika playground benar-benar digunakan.

Home page preview tidak harus memuat Monaco penuh jika berdampak besar pada performance.

Boleh gunakan lightweight styled code preview.

---

# Search Section

Karena dokumentasi akan semakin banyak, search harus menjadi bagian penting.

Buat command/search experience seperti:

```text
Search FumaDocs...

⌘ K
```

Search dapat menemukan:

```text
Data Structures
  Binary Search

Machine Learning
  Linear Regression

Deep Learning
  Backpropagation

Cryptography
  RSA
```

Search menggunakan fitur search Fumadocs.

---

# Documentation Structure Preview

Tampilkan struktur dokumentasi secara ringan:

```text
FumaDocs

├── Data Structures & Algorithms
│   ├── Array
│   ├── Linked List
│   ├── Stack
│   ├── Queue
│   ├── Tree
│   └── Graph
│
├── Machine Learning
│   ├── Linear Regression
│   ├── Classification
│   └── Clustering
│
├── Deep Learning
│   ├── Neural Networks
│   ├── CNN
│   └── Transformers
│
└── Cryptography
    ├── Hashing
    ├── Encryption
    └── Digital Signature
```

Tidak harus berupa literal file tree.

Boleh dibuat sebagai typography navigation yang clean.

---

# Motion Guidelines

Animation harus terasa purposeful.

Gunakan Motion untuk:

* Page entrance
* Section reveal
* Interactive visual
* Hover state
* Number transitions
* Algorithm movement
* Neural network activation
* Cryptography transformation

Hindari:

* bouncing berlebihan
* parallax agresif
* infinite floating element
* animation hanya untuk dekorasi

Gunakan duration sekitar:

```text
150–250ms → UI interaction
300–500ms → layout transition
500–1000ms → visualization
```

Untuk simulation, duration tergantung playback speed.

---

# Scroll Behaviour

Saat scrolling:

* Section muncul dengan opacity + sedikit translate
* Divider tetap minimal
* Visual bisa mulai animate ketika masuk viewport
* Jangan membuat seluruh halaman penuh scroll-jacking
* Jangan mengubah scroll browser secara agresif

Scrolling harus tetap natural.

---

# Typography

Gunakan typography modern dan technical.

Heading:

* Bold tetapi tidak terlalu besar
* Tight letter spacing
* Strong hierarchy

Body:

* Comfortable line height
* Maximum readable width
* High contrast

Code:

* Monospace font

Contoh hierarchy:

```text
Hero Heading
56–72px desktop

Section Heading
36–48px

Subheading
18–20px

Body
15–17px
```

Responsive untuk mobile.

---

# Responsive Design

Desktop tidak boleh hanya diperkecil untuk mobile.

Mobile harus memiliki layout sendiri.

Contoh explore:

Desktop:

```text
01     Data Structures                Visual
```

Mobile:

```text
01

Data Structures

description

[ visual ]

Explore →
```

Interactive visualization tetap usable pada layar kecil.

---

# Footer

Footer sangat sederhana.

Contoh:

```text
FumaDocs

Interactive Computer Science Documentation

Docs
GitHub
About

© FumaDocs
```

Tidak perlu footer besar dengan banyak column.

---

# Suggested Home Structure

Urutan halaman:

```text
Navbar

Hero
↓
Interactive Hero Visualization
↓
Explore 4 Documentation Areas
↓
Interactive Learning / Algorithm Demo
↓
Code Playground Preview
↓
Documentation/Search Preview
↓
Final CTA
↓
Footer
```

---

# Final CTA

Buat CTA sederhana.

```text
Start exploring.

Learn concepts.
Run experiments.
See how they work.

Explore Documentation →
```

Background tetap clean.

Tidak perlu gradient besar atau card.

---

# Components

Pisahkan implementasi menjadi reusable components.

Contoh:

```text
components/home/

Navbar.tsx

Hero.tsx
HeroVisualizer.tsx

ExploreSection.tsx
ExploreItem.tsx

visualizations/
├── DataStructurePreview.tsx
├── MachineLearningPreview.tsx
├── NeuralNetworkPreview.tsx
└── CryptographyPreview.tsx

InteractiveDemo.tsx
CodePlaygroundPreview.tsx

SearchPreview.tsx
FinalCTA.tsx
Footer.tsx
```

Jangan membuat seluruh home page di satu file besar.

---

# Performance

Interactive visualization jangan mengorbankan performance.

Gunakan:

* SVG untuk visual sederhana
* CSS transform
* Motion
* dynamic import untuk component berat
* lazy loading ketika dibutuhkan

Jangan memuat Monaco Editor pada initial page load jika hanya digunakan sebagai visual preview.

Jangan memuat React Flow jika halaman Home tidak membutuhkan interactive graph penuh.

Target utama:

* Fast initial load
* Smooth animation
* No layout shift
* Responsive
* Good accessibility

---

# Accessibility

Pastikan:

* Semantic HTML
* Keyboard navigation
* Focus state jelas
* Proper contrast
* Button memiliki accessible label
* Mendukung `prefers-reduced-motion`

Jika user memilih reduced motion, kurangi atau hilangkan animasi non-esensial.

---

# UX Philosophy

FumaDocs harus terasa seperti:

```text
Documentation
     +
Interactive textbook
     +
Algorithm visualizer
     +
Code playground
```

Bukan:

```text
Generic SaaS landing page
```

Dan bukan:

```text
Traditional static documentation website
```

Fokus utama desain adalah:

**Reading → Understanding → Visualizing → Experimenting**

Setiap elemen di Home Page harus mendukung alur tersebut.

---

# Expected Result

Hasil akhir harus terasa:

* Clean
* Modern
* Fast
* Technical
* Academic tetapi tidak kaku
* Interactive
* Premium
* Minimal
* Comfortable untuk membaca dalam waktu lama

Home page harus membuat user langsung memahami bahwa FumaDocs memiliki empat area utama:

**Data Structures & Algorithms · Machine Learning · Deep Learning · Cryptography**

dan bahwa setiap materi dapat berkembang menjadi pengalaman belajar berbasis **documentation + code + interactive visualization**.
