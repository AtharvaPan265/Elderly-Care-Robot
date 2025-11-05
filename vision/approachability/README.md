# Approachability Prediction — Human Welcome vs Ignore

This repository contains a small end-to-end pipeline to predict whether a human approaching a group will be welcomed (label=1) or ignored (label=0). The project includes data preprocessing, simple feature aggregation from participant questionnaires, baseline models (Logistic Regression, Random Forest) and a neural-network baseline (MLP). It also includes plotting utilities to produce report-ready figures.

This README explains the datasets you uploaded, how the pipeline works, how to reproduce the results, and recommended files to include in a public GitHub repository.

## Contents (important files you uploaded)
- `Personality.csv` — Big Five questionnaire responses per participant (IDs like `a1`, `b3`).
- `Human_study.csv` — Human-study questionnaire per participant (likert items).
- `Robot_Study.csv` — Robot-study questionnaire per participant (likert items).
- `GQS.csv` — Godspeed Questionnaire responses (some groups/rows are empty in this dataset).
- `group_behavior_labels.csv` — Ground-truth labels per group trial. `0` = Ignore, `1` = Welcome, `x` = excluded/missing.
- `static_features_aggregated.csv` — Aggregated group-level features (group means / stds and approacher features where available).
- `training_data_with_labels.csv` — Merged dataset used for modeling (features + label per trial).
- `summary.csv` — Short summary of trained model accuracies from the last run.
- `train_pipeline.py` — Main script: loads data, aggregates features, trains models, saves artifacts.
- `visualize_results.py` — Generates PNG plots (label distribution, PCA scatter, confusion matrices, ROC curves) in `results/plots/`.

## High-level pipeline
1. Load questionnaire CSVs and parse participant IDs (e.g. `a1` => group `a`, participant 1).
2. Aggregate participant-level features into group means and group standard deviations (participants 1–3 are group members; participant 4 is the approacher when present).
3. Merge the aggregated static features with `group_behavior_labels.csv` (filtering to human trials) to produce `training_data_with_labels.csv`.
4. Preprocess: drop features that are entirely missing, median-impute remaining missing values, and scale features with `StandardScaler`.
5. Train baseline models: Logistic Regression and Random Forest. Train an MLP with class rebalancing; the pipeline supports SMOTE (synthetic oversampling) via `imbalanced-learn`.
6. Save models to the `models/` directory and summary outputs to `results/`.

## Quickstart — reproduce locally
These commands assume you run them from the dataset folder (where the CSV files and scripts live). On macOS with zsh (example):

1) Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Run the training pipeline

```bash
python train_pipeline.py
```

This will create `models/` (saved joblib models) and `results/` (training data CSV, `summary.csv`).

4) Generate plots

```bash
python visualize_results.py
```

Plots are saved to `results/plots/`.

## Notes about the data and outputs
- Many `Approacher_*` columns in the provided CSVs are empty (all-NaN) for this dataset. The pipeline drops fully-empty features before imputation to avoid errors. You can see the dropped list printed when the script runs.
- `group_behavior_labels.csv` contains rows with label `x` — those are filtered out and not used for training.
- The train/test split is stratified (test_size=0.2, random_state=42). The pipeline prints classification reports and confusion matrices for the test split.
- The MLP training supports two imbalance-handling approaches: class-weighted fitting and synthetic oversampling (SMOTE). SMOTE requires `imbalanced-learn` and is enabled in the current pipeline by default for the MLP run.

## What to put in GitHub (recommended)
Include these items in the repository so others can reproduce and review your work:

- Code and docs
  - `train_pipeline.py`, `visualize_results.py`, `questionnaire_and_label_processing.py` (processing utilities), `hyperparam_mlp_smote.py` (if used)
  - `requirements.txt`
  - `README.md`, `README_RUN.md` (or merge into README)
  - `LICENSE` (pick appropriate license for your project)

- Small example data
  - Include a `data/sample/` folder with 1–2 example rows from each CSV to illustrate format (do not include the entire dataset if it's large or sensitive).

Exclude these from the repository (add to `.gitignore`):

- `venv/` or `.venv/` — virtual environment
- `models/` — trained model artifacts (.joblib). Prefer GitHub Releases or Git LFS for distributing large binaries.
- `results/` — intermediate outputs and full plots (you may include a small `results/plots/demo.png` if useful)
- raw motion-capture exports or other large binary files (e.g., `human-group/*` and `robot-group/*` if they are large)

Suggested `.gitignore` snippet (add to repo root):

```
venv/
.venv/
__pycache__/
*.pyc
models/
results/
data/raw/
.DS_Store
.vscode/
```

## Reproducibility and publishing models
- If you want to publish trained models, prefer either:
  - GitHub Releases (attach the joblib files to a release), or
  - Git LFS for artifacts tracked in the repo.
- Record environment details (Python version, package versions) — `requirements.txt` is included; pin versions before publishing for exact reproducibility.

## Recommended next tasks (optional enhancements)
- Add a short unit test for preprocessing to ensure approacher and group-level aggregation are correct.
- Add a small CLI or configuration file (`config.yaml`) to toggle SMOTE, control model hyperparameters, and enable/disable plotting.
- Add feature-importance outputs (Random Forest feature importances) and a short table in `results/`.
- If you plan to share the dataset, create a small `data/README.md` that documents column names and formats.

## Contact / Attribution
If this work is part of a publication or report, please include a citation or short description in `README.md` describing the study and data provenance.

---
If you want, I can also create the `.gitignore` and a polished `LICENSE` for you and stage them in the workspace. Do you want that? 
