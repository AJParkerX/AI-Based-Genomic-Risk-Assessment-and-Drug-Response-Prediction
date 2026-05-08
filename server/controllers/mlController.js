const DEFAULT_ML_API_URLS = ["http://127.0.0.1:8000", "http://localhost:8000"];
const MODEL_INPUT_DIM = Number.parseInt(process.env.MODEL_INPUT_DIM || "320", 10);
const ML_API_TIMEOUT_MS = Number.parseInt(
  process.env.ML_API_TIMEOUT_MS || "12000",
  10
);
const INVALID_DATA_MESSAGE = "Invalid data, enter correct data";

const RISK_FIELDS = [
  "rsid",
  "chromosome",
  "position",
  "referenceAllele",
  "alternateAllele",
  "gene",
  "clinicalSignificance",
  "molecularConsequence",
  "diseaseTrait",
  "study",
  "journal",
  "initialSampleSize",
  "replicationSampleSize",
  "pValue",
  "orBeta",
  "alleleFrequency",
  "genotype",
  "ancestry",
];

const DRUG_FIELDS = [
  "drug",
  "gene",
  "allele",
  "comparisonAllele",
  "metabolizer",
  "comparisonMetabolizer",
  "disease",
  "populationType",
  "direction",
  "rsid",
  "pkTerm",
  "isAssociated",
];

const DRUG_DESCRIPTIONS = {
  Effective:
    "Predicted genomic profile indicates favorable drug metabolism and expected treatment benefit.",
  Resistant:
    "Predicted genomic profile suggests partial or limited treatment response for this drug.",
  Toxic:
    "Predicted genomic profile indicates elevated adverse-reaction risk with this drug.",
};

class InvalidDataError extends Error {
  constructor(message = INVALID_DATA_MESSAGE) {
    super(message);
    this.name = "InvalidDataError";
  }
}

const normalizeBaseUrl = (url) => {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.replace(/\/predict(?:\/drug)?$/i, "");
};

const getMlApiBaseUrls = () => {
  const configuredUrls = String(process.env.ML_API_URL || "")
    .split(",")
    .map(normalizeBaseUrl)
    .filter(Boolean);

  const baseUrls = [...configuredUrls, ...DEFAULT_ML_API_URLS];
  return [...new Set(baseUrls)];
};

const sanitizeNumber = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value > 1e6) return 1e6;
  if (value < -1e6) return -1e6;
  return value;
};

const signedLog = (value) => {
  const num = sanitizeNumber(value);
  return Math.sign(num) * Math.log1p(Math.abs(num));
};

const fnv1a = (text, seed = 2166136261) => {
  let hash = seed >>> 0;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const hashToUnit = (text, seed = 2166136261) => {
  const hash = fnv1a(text, seed);
  return (hash / 0xffffffff) * 2 - 1;
};

const parseNumericValue = (rawValue) => {
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue !== "string") return null;
  const value = rawValue.trim();
  if (!value) return null;

  const rsMatch = value.match(/^rs(\d+)$/i);
  if (rsMatch) return Number.parseFloat(rsMatch[1]);

  const cleaned = value.replace(/,/g, "").replace(/%$/, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const encodeAllele = (value) => {
  const normalized = value.toUpperCase();
  const map = { A: 0.25, C: 0.5, G: 0.75, T: 1 };
  if (normalized.length === 1 && map[normalized] !== undefined) {
    return map[normalized];
  }
  return hashToUnit(normalized, 1315423911);
};

const encodeGenotype = (value) => {
  const normalized = value.toUpperCase();
  const map = {
    AA: 0,
    AC: 0.5,
    AG: 0.5,
    AT: 0.5,
    CC: 1,
    CG: 1.5,
    CT: 1.5,
    GG: 2,
    GT: 2.5,
    TT: 3,
  };

  if (map[normalized] !== undefined) {
    return map[normalized];
  }

  if (/^[ACGT]{2}$/.test(normalized)) {
    const sorted = normalized.split("").sort().join("");
    return map[sorted] ?? hashToUnit(normalized, 2654435761);
  }

  return hashToUnit(normalized, 2654435761);
};

const encodeFieldValue = (fieldName, rawValue) => {
  const value = String(rawValue ?? "").trim();
  const lowerField = fieldName.toLowerCase();

  if (!value) {
    return {
      vector: [0, 0, 0, 0, 0, 0, 0, 0],
      informative: false,
    };
  }

  let primaryValue;
  const numericValue = parseNumericValue(value);

  if (numericValue !== null) {
    primaryValue = signedLog(numericValue);
  } else if (lowerField.includes("genotype")) {
    primaryValue = signedLog(encodeGenotype(value));
  } else if (lowerField.includes("allele")) {
    primaryValue = signedLog(encodeAllele(value));
  } else {
    primaryValue = hashToUnit(value.toLowerCase(), 374761393);
  }

  const chars = Array.from(value);
  const lengthNorm = Math.min(value.length / 40, 1);
  const digitCount = (value.match(/\d/g) || []).length;
  const upperCount = (value.match(/[A-Z]/g) || []).length;
  const digitRatio = value.length ? digitCount / value.length : 0;
  const upperRatio = value.length ? upperCount / value.length : 0;
  const asciiMean =
    chars.length > 0
      ? chars.reduce((sum, char) => sum + char.charCodeAt(0), 0) /
        chars.length /
        127
      : 0;

  const vector = [
    sanitizeNumber(primaryValue),
    numericValue !== null ? 1 : 0,
    lengthNorm,
    digitRatio,
    upperRatio,
    hashToUnit(`${fieldName}:${value.toLowerCase()}`, 668265263),
    hashToUnit(`${value.toLowerCase()}:${fieldName}`, 2246822519),
    asciiMean,
  ];

  return {
    vector,
    informative: true,
  };
};

const calculateVariance = (numbers) => {
  if (!numbers.length) return 0;
  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  return (
    numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    numbers.length
  );
};

const expandToModelInput = (seedFeatures, contextText) => {
  if (!seedFeatures.length) {
    throw new InvalidDataError();
  }

  const features = [...seedFeatures];
  while (features.length < MODEL_INPUT_DIM) {
    const index = features.length;
    const a = seedFeatures[index % seedFeatures.length];
    const b = seedFeatures[(index * 13 + 7) % seedFeatures.length];
    const noise = hashToUnit(`${contextText}:${index}`, 3266489917);
    features.push(Math.tanh(a * 0.58 + b * 0.32 + noise * 0.1));
  }

  return features.slice(0, MODEL_INPUT_DIM).map(sanitizeNumber);
};

const validateFeatureSignal = (features) => {
  const nonZero = features.filter((value) => Math.abs(value) > 1e-9).length;
  const variance = calculateVariance(features);

  if (nonZero < 16 || variance < 1e-8) {
    throw new InvalidDataError();
  }
};

const buildFeaturesFromFormData = (formData, fieldOrder) => {
  if (!formData || typeof formData !== "object") {
    throw new InvalidDataError();
  }

  const values = fieldOrder.map((field) => String(formData[field] ?? "").trim());
  const filledCount = values.filter(Boolean).length;
  const minimumRequired = Math.max(3, Math.ceil(fieldOrder.length * 0.3));

  if (filledCount < minimumRequired) {
    throw new InvalidDataError();
  }

  const encoded = fieldOrder.map((field, index) =>
    encodeFieldValue(field, values[index])
  );
  const informativeCount = encoded.filter((item) => item.informative).length;

  if (informativeCount < minimumRequired) {
    throw new InvalidDataError();
  }

  const seedFeatures = [];
  const fieldPrimaryValues = [];

  encoded.forEach((item) => {
    seedFeatures.push(...item.vector);
    fieldPrimaryValues.push(item.vector[0]);
  });

  for (let index = 0; index < fieldPrimaryValues.length - 1; index += 1) {
    const current = fieldPrimaryValues[index];
    const next = fieldPrimaryValues[index + 1];
    seedFeatures.push(current * next);
    seedFeatures.push(current - next);
  }

  const joined = fieldOrder
    .map((field, index) => `${field}:${values[index].toLowerCase()}`)
    .join("|");

  const tokens = joined.split(/[^a-z0-9.+-]+/i).filter(Boolean);
  const bins = new Array(96).fill(0);
  tokens.forEach((token) => {
    const binIndex = fnv1a(token, 974711) % bins.length;
    const sign = (fnv1a(token, 1469598103) & 1) === 0 ? -1 : 1;
    bins[binIndex] += sign * (token.length / 12);
  });
  seedFeatures.push(...bins.map((value) => Math.tanh(value)));

  const features = expandToModelInput(seedFeatures, joined);
  validateFeatureSignal(features);
  return features;
};

const buildFeaturesFromArray = (rawFeatures) => {
  if (!Array.isArray(rawFeatures) || rawFeatures.length < 3) {
    throw new InvalidDataError();
  }

  const seedFeatures = rawFeatures.map((value) => {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return 0;
    return signedLog(parsed);
  });

  const contextText = seedFeatures.map((value) => value.toFixed(6)).join("|");
  const features = expandToModelInput(seedFeatures, contextText);
  validateFeatureSignal(features);
  return features;
};

const getModelFeatures = (body, type) => {
  if (Array.isArray(body?.features)) {
    return buildFeaturesFromArray(body.features);
  }

  const fields = type === "risk" ? RISK_FIELDS : DRUG_FIELDS;
  return buildFeaturesFromFormData(body?.formData, fields);
};

const postToMlApi = async (path, payload) => {
  const attemptedErrors = [];

  for (const baseUrl of getMlApiBaseUrls()) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(
      () => controller.abort(),
      ML_API_TIMEOUT_MS
    );

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const json = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, json, baseUrl };
    } catch (error) {
      attemptedErrors.push(`${baseUrl} -> ${error.message}`);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  throw new Error(`ML API connection failed: ${attemptedErrors.join(" | ")}`);
};

const buildDrugResponseFromRisk = (riskData) => {
  const probabilities = riskData?.probabilities || {};

  const effective =
    (probabilities["Very Low Risk"] || 0) + (probabilities["Low Risk"] || 0);
  const resistant = probabilities["Moderate Risk"] || 0;
  const toxic =
    (probabilities["High Risk"] || 0) + (probabilities["Very High Risk"] || 0);

  const responseProbabilities = {
    Effective: effective,
    Resistant: resistant,
    Toxic: toxic,
  };

  const [classification = "Resistant", confidenceScore = 0] = Object.entries(
    responseProbabilities
  ).sort((a, b) => b[1] - a[1])[0] || ["Resistant", 0];

  const topSignals = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label, score]) => `${label} (${(score * 100).toFixed(1)}%)`)
    .join(", ");

  return {
    classification,
    confidence: `${(confidenceScore * 100).toFixed(2)}%`,
    description: DRUG_DESCRIPTIONS[classification],
    why: topSignals
      ? `Driven by strongest risk signals: ${topSignals}.`
      : "Derived from the model's risk probability distribution.",
    response_probabilities: responseProbabilities,
    risk_probabilities: probabilities,
    responseProbabilities,
    riskProbabilities: probabilities,
  };
};

const handleMlError = (res, mlResponse, fallbackMsg) => {
  if (mlResponse.status === 400) {
    return res
      .status(400)
      .json({ msg: INVALID_DATA_MESSAGE, detail: INVALID_DATA_MESSAGE });
  }

  return res.status(502).json({
    msg: fallbackMsg,
    detail: mlResponse.json?.detail || mlResponse.json?.msg,
  });
};

export const predictRisk = async (req, res) => {
  try {
    const features = getModelFeatures(req.body, "risk");
    const mlResponse = await postToMlApi("/predict", { features });

    if (!mlResponse.ok) {
      return handleMlError(res, mlResponse, "ML API risk prediction failed");
    }

    return res.json(mlResponse.json);
  } catch (error) {
    if (error instanceof InvalidDataError) {
      return res
        .status(400)
        .json({ msg: INVALID_DATA_MESSAGE, detail: INVALID_DATA_MESSAGE });
    }

    return res.status(500).json({
      msg: "Unable to fetch risk prediction from ML API",
      detail: error.message,
    });
  }
};

export const predictDrug = async (req, res) => {
  try {
    const features = getModelFeatures(req.body, "drug");

    const drugMlResponse = await postToMlApi("/predict/drug", { features });
    if (drugMlResponse.ok) {
      return res.json(drugMlResponse.json);
    }

    if (drugMlResponse.status !== 404) {
      return handleMlError(res, drugMlResponse, "ML API drug prediction failed");
    }

    const riskMlResponse = await postToMlApi("/predict", { features });
    if (!riskMlResponse.ok) {
      return handleMlError(
        res,
        riskMlResponse,
        "ML API fallback prediction failed"
      );
    }

    return res.json(buildDrugResponseFromRisk(riskMlResponse.json));
  } catch (error) {
    if (error instanceof InvalidDataError) {
      return res
        .status(400)
        .json({ msg: INVALID_DATA_MESSAGE, detail: INVALID_DATA_MESSAGE });
    }

    return res.status(500).json({
      msg: "Unable to fetch drug prediction from ML API",
      detail: error.message,
    });
  }
};
