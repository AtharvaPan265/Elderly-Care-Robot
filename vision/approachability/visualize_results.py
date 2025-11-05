"""Generate report-ready visualizations from the training outputs.

Creates the following plots and saves them to `results/plots/`:
 - label_distribution.png
 - pca_scatter.png (2D PCA colored by label)
 - {model}_confusion.png for each saved model
 - {model}_roc.png for each saved model (if probabilities available)

Run from the project root where `results/training_data_with_labels.csv` and `models/` exist.
"""

import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, roc_curve, auc, precision_recall_curve


def ensure_dir(p):
    os.makedirs(p, exist_ok=True)


def load_data(path='results/training_data_with_labels.csv'):
    df = pd.read_csv(path)
    return df


def prepare_features(merged):
    # follow same feature selection logic as train_pipeline
    feature_cols = [c for c in merged.columns if c.startswith(('Group_Mean_', 'Group_Std_', 'Approacher_', 'Diff_'))]
    # drop all-NaN columns
    all_nan = [c for c in feature_cols if merged[c].isna().all()]
    if all_nan:
        print(f"Dropping {len(all_nan)} all-NaN features (preview): {all_nan[:10]}")
        feature_cols = [c for c in feature_cols if c not in all_nan]
        merged = merged.drop(columns=all_nan)
    if len(feature_cols) == 0:
        raise RuntimeError('No feature columns available for visualization. Run preprocessing again.')

    imputer = SimpleImputer(strategy='median')
    X = imputer.fit_transform(merged[feature_cols])
    y = merged['Label'].astype(int).to_numpy()
    return X, y, feature_cols


def plot_label_distribution(y, out_dir):
    ensure_dir(out_dir)
    unique, counts = np.unique(y, return_counts=True)
    plt.figure(figsize=(4, 3))
    sns.barplot(x=unique, y=counts, palette='muted')
    plt.xlabel('Label')
    plt.ylabel('Count')
    plt.title('Label distribution')
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'label_distribution.png'), dpi=200)
    plt.close()


def plot_pca(X_s, y, out_dir):
    ensure_dir(out_dir)
    pca = PCA(n_components=2, random_state=42)
    Xp = pca.fit_transform(X_s)
    plt.figure(figsize=(6, 5))
    sns.scatterplot(x=Xp[:, 0], y=Xp[:, 1], hue=y, palette='Set1', alpha=0.8)
    plt.xlabel('PC1')
    plt.ylabel('PC2')
    plt.title('2D PCA of features (colored by label)')
    plt.legend(title='Label')
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'pca_scatter.png'), dpi=200)
    plt.close()


def plot_confusion(cm, labels, out_path):
    plt.figure(figsize=(4, 3))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False, xticklabels=labels, yticklabels=labels)
    plt.ylabel('True')
    plt.xlabel('Pred')
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def plot_roc(y_test, y_score, out_path):
    fpr, tpr, _ = roc_curve(y_test, y_score)
    roc_auc = auc(fpr, tpr)
    plt.figure(figsize=(4.5, 4))
    plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.3f}')
    plt.plot([0, 1], [0, 1], '--', color='gray')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC curve')
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


def main():
    out_dir = os.path.join('results', 'plots')
    ensure_dir(out_dir)

    merged = load_data()
    X, y, feature_cols = prepare_features(merged)

    # load scaler if available to match training preprocessing; else fit a scaler
    scaler_path = os.path.join('models', 'scaler.joblib')
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        X_s = scaler.transform(X)
    else:
        scaler = StandardScaler()
        X_s = scaler.fit_transform(X)

    # create the same test split used in training (stratify + random_state)
    X_train, X_test, y_train, y_test = train_test_split(X_s, y, stratify=y, test_size=0.2, random_state=42)

    # plot basic global charts
    plot_label_distribution(y, out_dir)
    plot_pca(X_s, y, out_dir)

    # models to visualize (if present)
    model_files = {
        'logistic': os.path.join('models', 'logistic_model.joblib'),
        'random_forest': os.path.join('models', 'rf_model.joblib'),
        'mlp_neural_net': os.path.join('models', 'nn_model.joblib')
    }

    for name, path in model_files.items():
        if not os.path.exists(path):
            print(f"Model {name} not found at {path}; skipping plots for it.")
            continue
        model = joblib.load(path)
        try:
            y_pred = model.predict(X_test)
        except Exception as e:
            print(f"Error predicting with model {name}: {e}")
            continue

        cm = confusion_matrix(y_test, y_pred)
        plot_confusion(cm, labels=[0, 1], out_path=os.path.join(out_dir, f'{name}_confusion.png'))

        # ROC if probability or decision function available
        y_score = None
        if hasattr(model, 'predict_proba'):
            try:
                y_score = model.predict_proba(X_test)[:, 1]
            except Exception:
                y_score = None
        elif hasattr(model, 'decision_function'):
            try:
                y_score = model.decision_function(X_test)
            except Exception:
                y_score = None

        if y_score is not None:
            try:
                plot_roc(y_test, y_score, os.path.join(out_dir, f'{name}_roc.png'))
            except Exception as e:
                print(f"Unable to plot ROC for {name}: {e}")

    print('Saved plots to', out_dir)


if __name__ == '__main__':
    main()
