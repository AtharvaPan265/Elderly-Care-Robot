"""
Simple training pipeline for predicting whether a human approach will be welcomed (1) or ignored (0).
This script loads questionnaire CSVs and group labels, aggregates participant features into group-level
features and approacher features, merges with per-trial labels, trains two baseline models (LogisticRegression,
RandomForest), prints evaluation metrics, and saves models and results.

Usage:
    python train_pipeline.py

Outputs:
    - models/logistic_model.joblib
    - models/rf_model.joblib
    - models/scaler.joblib
    - results/summary.csv
    - results/training_data_with_labels.csv

Note: install dependencies from `requirements.txt` first.
"""

import os
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
from sklearn.utils import resample
from sklearn.impute import SimpleImputer
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
import joblib
# optional import for SMOTE oversampling (imbalanced-learn)
try:
    from imblearn.over_sampling import SMOTE
except Exception:
    SMOTE = None


def load_questionnaire(file_name, q_prefix, skip_rows=0):
    df = pd.read_csv(file_name, header=None, skiprows=skip_rows, dtype=str)
    df.rename(columns={0: 'Participant_ID'}, inplace=True)
    new_cols = {i: f'{q_prefix}_Q{i}' for i in range(1, df.shape[1])}
    df.rename(columns=new_cols, inplace=True)

    for col in df.columns:
        if col.startswith(f'{q_prefix}_Q'):
            df[col] = pd.to_numeric(df[col], errors='coerce')

    df.dropna(subset=['Participant_ID'], inplace=True)
    df['Group_ID'] = df['Participant_ID'].astype(str).str.extract(r'([a-jA-J])')[0].str.lower()
    df['Participant_Num'] = pd.to_numeric(df['Participant_ID'].astype(str).str.extract(r'(\d)')[0], errors='coerce').astype('Int64')
    df.dropna(subset=['Group_ID', 'Participant_Num'], inplace=True)
    return df


def group_number_to_letter(n):
    try:
        n_int = int(n)
        return chr(ord('a') + n_int - 1)
    except Exception:
        return None


def main():
    # load labels
    labels_df = pd.read_csv('group_behavior_labels.csv', header=0)
    labels_df.columns = ['Group_ID', 'Trial_Num', 'Label']
    labels_df_cleaned = labels_df[labels_df['Label'] != 'x'].copy()
    labels_df_cleaned['Label'] = pd.to_numeric(labels_df_cleaned['Label'], errors='coerce')

    # create Study_Type
    labels_df_cleaned['Study_Type'] = labels_df_cleaned['Trial_Num'].astype(str).apply(lambda x: 'Robot' if str(x).startswith('t') else 'Human')

    # Load questionnaires
    personality_df = load_questionnaire('Personality.csv', 'P', skip_rows=0)
    human_study_df = load_questionnaire('Human_study.csv', 'H', skip_rows=0)
    # Robot/GQS CSVs in provided dataset appear to have empty header rows — try with skiprows=0
    robot_study_df = load_questionnaire('Robot_Study.csv', 'R', skip_rows=0)
    gqs_df = load_questionnaire('GQS.csv', 'G', skip_rows=0)

    # Merge participant-level data
    participant_features_df = pd.merge(personality_df, human_study_df.drop(columns=['Group_ID', 'Participant_Num'], errors='ignore'), on='Participant_ID', how='outer')
    participant_features_df = pd.merge(participant_features_df, robot_study_df.drop(columns=['Group_ID', 'Participant_Num'], errors='ignore'), on='Participant_ID', how='outer')
    participant_features_df = pd.merge(participant_features_df, gqs_df.drop(columns=['Group_ID', 'Participant_Num'], errors='ignore'), on='Participant_ID', how='outer')

    participant_features_df['Group_ID'] = participant_features_df['Participant_ID'].astype(str).str.extract(r'([a-jA-J])')[0].str.lower()
    participant_features_df['Participant_Num'] = pd.to_numeric(participant_features_df['Participant_ID'].astype(str).str.extract(r'(\d)')[0], errors='coerce').astype('Int64')

    # group members (1-3)
    group_members_df = participant_features_df[participant_features_df['Participant_Num'].isin([1, 2, 3])]
    group_cols = [col for col in group_members_df.columns if col.startswith(('P_', 'H_', 'R_', 'G_'))]
    group_features_mean = group_members_df.groupby('Group_ID')[group_cols].mean().reset_index()
    group_features_mean.columns = ['Group_ID'] + [f'Group_Mean_{col}' for col in group_features_mean.columns if col != 'Group_ID']

    # Add group-level standard deviation features (inter-person variance)
    group_features_std = group_members_df.groupby('Group_ID')[group_cols].std().reset_index()
    group_features_std.columns = ['Group_ID'] + [f'Group_Std_{col}' for col in group_features_std.columns if col != 'Group_ID']
    # merge mean and std
    group_features_mean = pd.merge(group_features_mean, group_features_std, on='Group_ID', how='left')

    # approacher features (participant 4)
    approacher_df = participant_features_df[participant_features_df['Participant_Num'] == 4].drop(columns=['Participant_Num', 'Participant_ID'])
    if 'Group_ID' in approacher_df.columns:
        approacher_features = approacher_df.copy()
        approacher_features.columns = ['Group_ID'] + [f'Approacher_{col}' for col in approacher_features.columns if col != 'Group_ID']
    else:
        approacher_features = pd.DataFrame(columns=['Group_ID'])

    # Ensure Group_ID columns have the same dtype before merging
    group_features_mean['Group_ID'] = group_features_mean['Group_ID'].astype(str).str.lower()
    if 'Group_ID' in approacher_features.columns and not approacher_features.empty:
        approacher_features['Group_ID'] = approacher_features['Group_ID'].astype(str).str.lower()

    static_features_df = pd.merge(group_features_mean, approacher_features, on='Group_ID', how='left')
    static_features_df.to_csv('static_features_aggregated.csv', index=False)

    # Prepare labels -> map group numbers to letters, filter humans
    labels_df_cleaned['Group_Letter'] = labels_df_cleaned['Group_ID'].apply(group_number_to_letter)
    human_labels = labels_df_cleaned[labels_df_cleaned['Study_Type'] == 'Human'].copy()

    merged = pd.merge(human_labels, static_features_df, left_on='Group_Letter', right_on='Group_ID', how='left', suffixes=('_label', '_group'))
    merged = merged.dropna(subset=['Label'])

    feature_cols = [c for c in merged.columns if c.startswith('Group_Mean_') or c.startswith('Approacher_')]
    if len(feature_cols) == 0:
        print('No feature columns found. Check that questionnaires were loaded correctly and contain numeric columns.')
        return

    # Feature engineering: differences between approacher and group means where both exist
    # For each P_/H_/G_/R_ question in group mean, if approacher counterpart exists, create Approacher_minus_Group feature
    for col in list(merged.columns):
        if col.startswith('Group_Mean_'):
            appr_col = 'Approacher_' + col.replace('Group_Mean_', '')
            if appr_col in merged.columns:
                merged[f'Diff_{appr_col}_minus_{col}'] = merged[appr_col] - merged[col]

    # Update feature columns to include std and difference features
    feature_cols = [c for c in merged.columns if c.startswith(('Group_Mean_', 'Group_Std_', 'Approacher_', 'Diff_'))]

    # Drop features that are entirely NaN (no observed values) to avoid SimpleImputer skipping them
    all_nan_cols = [c for c in feature_cols if merged[c].isna().all()]
    if all_nan_cols:
        # show a short sample of dropped columns to keep output readable
        preview = all_nan_cols[:10]
        more = '...' if len(all_nan_cols) > 10 else ''
        print(f"Dropping {len(all_nan_cols)} features with all-missing values: {preview}{more}")
        feature_cols = [c for c in feature_cols if c not in all_nan_cols]
        merged = merged.drop(columns=all_nan_cols)

    if len(feature_cols) == 0:
        print('No usable feature columns after dropping all-NaN features. Check questionnaires or approacher rows.')
        return

    # Impute missing values with median (better than zero-fill)
    imputer = SimpleImputer(strategy='median')
    X = pd.DataFrame(imputer.fit_transform(merged[feature_cols]), columns=feature_cols)
    y = merged['Label'].astype(int)

    if len(y.unique()) < 2:
        print('Not enough label variation to train. Labels found:', y.unique())
        return

    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)
    except Exception:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train_s, y_train)
    y_pred_lr = lr.predict(X_test_s)

    print('\n=== Logistic Regression ===')
    print(classification_report(y_test, y_pred_lr, zero_division=0))
    print('Confusion matrix:\n', confusion_matrix(y_test, y_pred_lr))

    rf = RandomForestClassifier(n_estimators=200, random_state=42)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)

    print('\n=== Random Forest ===')
    print(classification_report(y_test, y_pred_rf, zero_division=0))
    print('Confusion matrix:\n', confusion_matrix(y_test, y_pred_rf))

    os.makedirs('models', exist_ok=True)
    os.makedirs('results', exist_ok=True)
    joblib.dump(lr, os.path.join('models', 'logistic_model.joblib'))
    joblib.dump(rf, os.path.join('models', 'rf_model.joblib'))
    joblib.dump(scaler, os.path.join('models', 'scaler.joblib'))

    summary = {
        'model': ['logistic', 'random_forest'],
        'accuracy': [float((y_test == y_pred_lr).mean()), float((y_test == y_pred_rf).mean())]
    }
    pd.DataFrame(summary).to_csv(os.path.join('results', 'summary.csv'), index=False)
    merged.to_csv(os.path.join('results', 'training_data_with_labels.csv'), index=False)

    # Cross-validated evaluation helper
    def cv_report(model, X_all, y_all, cv=5):
        skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)
        accs = []
        precisions = []
        recalls = []
        f1s = []
        for train_idx, test_idx in skf.split(X_all, y_all):
            X_tr, X_te = X_all[train_idx], X_all[test_idx]
            y_tr, y_te = y_all[train_idx], y_all[test_idx]
            # optional simple class weighting via sample_weight for classifiers that accept it
            try:
                # For MLP we will compute sample weights
                classes = np.unique(y_tr)
                cw = compute_class_weight('balanced', classes=classes, y=y_tr)
                cw_dict = {c: w for c, w in zip(classes, cw)}
                sample_w = np.array([cw_dict[int(v)] for v in y_tr])
                model.fit(X_tr, y_tr, sample_weight=sample_w)
            except TypeError:
                model.fit(X_tr, y_tr)
            y_pred = model.predict(X_te)
            accs.append(accuracy_score(y_te, y_pred))
            p, r, f, _ = precision_recall_fscore_support(y_te, y_pred, average='macro', zero_division=0)
            precisions.append(p); recalls.append(r); f1s.append(f)
        return {
            'accuracy_mean': np.mean(accs), 'accuracy_std': np.std(accs),
            'precision_mean': np.mean(precisions), 'recall_mean': np.mean(recalls), 'f1_mean': np.mean(f1s)
        }

    # --- Neural network baseline (MLP) with class weighting to address imbalance ---

    # --- Neural network baseline (MLP) with class weighting to address imbalance ---
    def train_mlp(X_train_s, X_test_s, y_train, y_test, oversample=False, use_smote=False):
        # Optionally oversample minority class in training set
        X_tr = X_train_s
        y_tr = y_train
        if use_smote:
            if SMOTE is None:
                raise ImportError('imbalanced-learn (SMOTE) not available. Please install imbalanced-learn.')
            # Apply SMOTE on the scaled training set to synthesize minority samples
            sm = SMOTE(random_state=42)
            X_tr, y_tr = sm.fit_resample(X_tr, y_tr)
        elif oversample:
            # simple upsampling of minority class in feature space (on scaled data)
            Xy = np.hstack([X_train_s, y_train.to_numpy().reshape(-1, 1)])
            df = None
            # perform resampling using numpy indices
            classes, counts = np.unique(y_train, return_counts=True)
            if len(classes) > 1:
                max_count = counts.max()
                X_resampled = []
                y_resampled = []
                for cls in classes:
                    idx = np.where(y_train == cls)[0]
                    if len(idx) == 0:
                        continue
                    if len(idx) < max_count:
                        replace = True
                    else:
                        replace = False
                    chosen = resample(idx, replace=replace, n_samples=max_count, random_state=42)
                    X_resampled.append(X_train_s[chosen])
                    y_resampled.append(y_train.to_numpy()[chosen])
                X_tr = np.vstack(X_resampled)
                y_tr = np.hstack(y_resampled)

        # compute class weights and map to sample weights for training (still useful if not using SMOTE)
        classes = np.unique(y_tr)
        class_weights = compute_class_weight(class_weight='balanced', classes=classes, y=y_tr)
        cw_dict = {c: w for c, w in zip(classes, class_weights)}
        sample_weight = np.array([cw_dict[int(v)] for v in y_tr])

        # small grid search for a few MLP hyperparams for robustness
        param_grid = {
            'hidden_layer_sizes': [(100, 50), (128, 64), (64, 32)],
            'alpha': [1e-4, 1e-3],
            'learning_rate_init': [1e-3, 5e-4]
        }
        base_mlp = MLPClassifier(activation='relu', solver='adam', early_stopping=True, max_iter=1000, random_state=42)
        try:
            gs = GridSearchCV(base_mlp, param_grid, cv=3, scoring='f1', n_jobs=-1)
            # GridSearchCV doesn't accept sample_weight in fit; if using SMOTE the data is balanced so this is fine
            gs.fit(X_tr, y_tr)
            mlp = gs.best_estimator_
        except Exception:
            # fallback to default if grid search fails
            mlp = MLPClassifier(hidden_layer_sizes=(100, 50), activation='relu', solver='adam',
                                early_stopping=True, max_iter=1000, random_state=42)
        # fit with sample weights to address imbalance
        try:
            # If SMOTE was used the classes are balanced and sample_weight is optional; still attempt weighted fit
            mlp.fit(X_tr, y_tr, sample_weight=sample_weight)
        except TypeError:
            mlp.fit(X_tr, y_tr)

        y_pred_mlp = mlp.predict(X_test_s)
        print('\n=== MLP Neural Network (class-weighted) ===')
        print(classification_report(y_test, y_pred_mlp, zero_division=0))
        print('Confusion matrix:\n', confusion_matrix(y_test, y_pred_mlp))

        # save
        joblib.dump(mlp, os.path.join('models', 'nn_model.joblib'))
        return mlp, y_pred_mlp

    try:
        # use SMOTE oversampling on the training set to synthetically balance minority class
        mlp_model, y_pred_mlp = train_mlp(X_train_s, X_test_s, y_train, y_test, oversample=False, use_smote=True)
        # append NN accuracy to summary
        nn_acc = float((y_test == y_pred_mlp).mean())
        summary = pd.read_csv(os.path.join('results', 'summary.csv'))
        summary = pd.concat([summary, pd.DataFrame({'model': ['mlp_neural_net'], 'accuracy': [nn_acc]})], ignore_index=True)
        summary.to_csv(os.path.join('results', 'summary.csv'), index=False)
    except Exception as e:
        print('Error training MLP neural network:', e)

    print('\nSaved models to ./models and results to ./results')


if __name__ == '__main__':
    main()
