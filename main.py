import csv
import cv2
import difflib
import numpy as np
import os
import re
import time
from datetime import datetime


def hex_to_bgr(hex_color: str) -> np.ndarray:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return np.array([b, g, r], dtype=np.float32)

TARGETS = {
    "VERDE": hex_to_bgr("#3b9233"),
    "AMBAR": hex_to_bgr("#f15c0d"),
    "TRANSPARENTE": hex_to_bgr("#ffffff"),
}

BRANDS = [
    "Tecate",
    "Dos Equis",
    "Indio",
    "Bohemia",
    "Sol",
    "Carta Blanca",
    "Superior",
    "Amstel Ultra",
    "Heineken",
    "Coors",
    "Miller",
]

def classify_color(mean_bgr: np.ndarray):
    distances = {
        name: float(np.linalg.norm(mean_bgr - ref))
        for name, ref in TARGETS.items()
    }
    best = min(distances, key=distances.get)
    return best, distances


ALIASES = {
    "Dos Equis": ["dos equis", "xx", "dos equis xx"],
    "Carta Blanca": ["carta blanca", "carta"],
    "Amstel Ultra": ["amstel ultra", "amstel"],
}

OCR_EVERY_N_FRAMES = 30
OCR_MIN_SCORE = 0.7


def match_brand(ocr_texts):
    """Fuzzy-match de textos OCR contra BRANDS. Devuelve (marca|None, score)."""
    full = " ".join(ocr_texts).lower().strip()
    if not full:
        return None, 0.0

    words = full.replace("-", " ").split()

    best_brand, best_score = None, 0.0
    for brand in BRANDS:
        b_low = brand.lower()

        # 1) coincidencia directa / alias con limites de palabra
        # (evita falsos positivos: "sol" en "consola", "xx" en "oxxo")
        candidates = [b_low] + ALIASES.get(brand, [])
        if any(re.search(r"\b" + re.escape(c) + r"\b", full)
               for c in candidates):
            return brand, 1.0

        # 2) fuzzy por marca completa
        score_full = difflib.SequenceMatcher(None, b_low, full).ratio()

        # 3) fuzzy por palabras (util si OCR trae texto extra)
        tokens = b_low.split()
        token_scores = []
        for tok in tokens:
            close = difflib.get_close_matches(tok, words, n=1, cutoff=0.75)
            if close:
                token_scores.append(
                    difflib.SequenceMatcher(None, tok, close[0]).ratio()
                )
            else:
                token_scores.append(0.0)
        score_tokens = sum(token_scores) / len(token_scores)

        score = max(score_full, score_tokens)
        if score > best_score:
            best_score, best_brand = score, brand

    if best_score >= OCR_MIN_SCORE:
        return best_brand, round(float(best_score), 2)
    return None, round(float(best_score), 2)


# --- Registro CSV: una fila por botella ---
CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "botellas_registradas.csv")
CSV_HEADER = ["timestamp", "marca", "marca_score", "color", "dist_color",
              "mean_r", "mean_g", "mean_b", "ocr_text"]
COOLDOWN_SEC = 8.0  # misma botella no se repite antes de este tiempo


def ensure_csv():
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(CSV_HEADER)


def log_bottle(marca, marca_score, color, dist_color, mean_rgb, ocr_text):
    ensure_csv()
    ts = datetime.now().isoformat(timespec="seconds")
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([ts, marca, marca_score, color,
                                f"{dist_color:.0f}",
                                int(mean_rgb[0]), int(mean_rgb[1]),
                                int(mean_rgb[2]), ocr_text])
    print(f"[CSV] {ts} | {marca} ({marca_score}) | {color} -> {CSV_PATH}")


try:
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()
    OCR_OK = True
except Exception as e:
    print("No se pudo inicializar OCR:", e)
    ocr_engine = None
    OCR_OK = False


vid = cv2.VideoCapture(0)
if not vid.isOpened():
    print("No se pudo abrir la camara (indice 0).")
    raise SystemExit(1)

try:
    frame_idx = 0
    last_brand = None
    last_brand_score = 0.0
    last_ocr_text = ""
    last_logged_key = None      # (marca, color) de la ultima fila guardada
    last_log_time = 0.0         # time.monotonic() del ultimo guardado
    log_count = 0
    ensure_csv()

    while True:
        ret, frame = vid.read()

        if not ret or frame is None:
            print("Failed to capture frame. Check webcam connection.")
            break

        frame_idx += 1
        h, w = frame.shape[:2]

        # ROI central (40%) para el color predominante
        rh, rw = int(h * 0.4), int(w * 0.4)
        x0, y0 = (w - rw) // 2, (h - rh) // 2
        x1, y1 = x0 + rw, y0 + rh
        roi = frame[y0:y1, x0:x1]

        mean_bgr = np.array(cv2.mean(roi)[:3], dtype=np.float32)
        mean_rgb = mean_bgr[::-1]
        color_label, distances = classify_color(mean_bgr)

        # --- OCR cada N frames sobre el frame completo ---
        if OCR_OK and (frame_idx % OCR_EVERY_N_FRAMES == 0):
            try:
                result, _ = ocr_engine(frame)
                if result:
                    texts = [box[1] for box in result if len(box) >= 2]
                    last_ocr_text = " | ".join(texts)
                    brand, score = match_brand(texts)
                    if brand is not None:
                        last_brand, last_brand_score = brand, score
                    # si no hay match, se conserva la ultima marca (estabilidad)
            except Exception as e:
                print("Error OCR:", e)

        # --- Overlay: ambos datos ---
        cv2.rectangle(frame, (x0, y0), (x1, y1), (255, 255, 255), 2)
        ref = TARGETS[color_label].astype(int)
        color_box = (int(ref[0]), int(ref[1]), int(ref[2]))

        cv2.rectangle(frame, (10, 10), (70, 70),
                      (int(mean_bgr[0]), int(mean_bgr[1]), int(mean_bgr[2])), -1)
        cv2.rectangle(frame, (10, 10), (70, 70), (255, 255, 255), 1)

        texto_color = f"COLOR: {color_label} ({distances[color_label]:.0f})"
        if last_brand:
            texto_marca = f"MARCA: {last_brand} ({last_brand_score})"
        else:
            texto_marca = "MARCA: ---"

        cv2.rectangle(frame, (0, h - 90), (w, h), (0, 0, 0), -1)
        cv2.putText(frame, texto_color, (10, h - 55),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, texto_marca, (10, h - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(frame, f"REG: {log_count}  [g]=guardar  [q]=salir",
                    (10, h - 95),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 1)

        info = (f"BGR:{mean_bgr.astype(int)} V:{distances['VERDE']:.0f} "
                f"A:{distances['AMBAR']:.0f} T:{distances['TRANSPARENTE']:.0f}")
        cv2.putText(frame, info, (80, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        if last_ocr_text:
            cv2.putText(frame, f"OCR: {last_ocr_text[:60]}", (80, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)

        cv2.rectangle(frame, (0, 0), (w - 1, h - 1), color_box, 4)
        cv2.imshow("frame", frame)

        # --- Registro: auto (marca nueva o cooldown) + manual con 'g' ---
        key = cv2.waitKey(1) & 0xFF
        now = time.monotonic()
        auto_due = (
            last_brand is not None
            and ((last_brand, color_label) != last_logged_key
                 or (now - last_log_time) > COOLDOWN_SEC)
        )
        just_logged = False
        if key == ord('g') or auto_due:
            marca_csv = last_brand if last_brand else "SIN_MARCA"
            log_bottle(marca_csv, last_brand_score, color_label,
                       distances[color_label], mean_rgb, last_ocr_text)
            last_logged_key = (last_brand, color_label)
            last_log_time = now
            log_count += 1
            just_logged = True

        # Consola sin spam: solo cada N frames o al registrar
        if just_logged or (frame_idx % OCR_EVERY_N_FRAMES == 0):
            print(f"RGB medio={mean_rgb.astype(int)} -> "
                  f"{texto_color} | {texto_marca}")

        if key == ord('q'):
            break

except Exception as e:
    print("Error occurred:", e)

finally:
    vid.release()
    cv2.destroyAllWindows()