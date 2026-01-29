# Understanding Embedding Distance & Compatibility Scores

## Current Status: Using General ImageNet Model

**Why "General"?**
We are currently using a **ResNet-18** model pre-trained on the **ImageNet** dataset. 
- **ImageNet** contains 1.2 million images across 1000 categories (dogs, cars, strawberries, televisions, etc.).
- It is NOT specialized for fashion.

**The "Clothing Cluster" Problem**
To a model trained to tell the difference between a `golden retriever` and a `toaster`:
1. A "White T-Shirt" and a "Blue Jean" look **extremely similar** (both are cloth, have folds, are centered objects).
2. Therefore, their "distance" in the embedding space is very small.
3. This creates a baseline "Similarity Score" of **~80-90%** for almost any two pieces of clothing.

## The Solution: Specialized Fashion Model

To get true compatibility scores (where a shirt and matching pants score high, but a mismatched outfit scores low), we need to load weights trained specifically on fashion data (like the Polyvore dataset mentioned in the research paper).

### Difference in "Distance"

| Model Type | What it sees | Similarity (Shirt vs Jeans) | Similarity (Shirt vs Toaster) |
|------------|--------------|-----------------------------|-------------------------------|
| **General (Current)** | "It's a soft object made of fabric" | **High (~0.90)** | Low (~0.10) |
| **Fashion (Goal)** | "This shirt matches the style of these jeans" | **High (~0.90)** | N/A |
| **Fashion (Goal)** | "This plaid shirt clashes with these plaid pants" | **Low (~0.20)** | N/A |

### Temporary Fix (UI Calibration)

Since we are currently stuck with the General model (until we get the fashion weights file), we "calibrate" the scores in the UI logic:
- We treat **0.80** as the "Zero Point" (0% Match).
- We treat **1.00** as the "Perfect Point" (100% Match).

This spreads out the scores so users see a difference between a "90% match" (actually 0.90 raw) and a "99% match" (actually 0.99 raw).
