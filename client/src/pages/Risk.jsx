import { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/ml";

export default function Risk() {
  const [formData, setFormData] = useState({
    rsid: "",
    chromosome: "",
    position: "",
    referenceAllele: "",
    alternateAllele: "",
    gene: "",
    clinicalSignificance: "",
    molecularConsequence: "",
    diseaseTrait: "",
    study: "",
    journal: "",
    initialSampleSize: "",
    replicationSampleSize: "",
    pValue: "",
    orBeta: "",
    alleleFrequency: "",
    genotype: "",
    ancestry: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rsid || !formData.gene) {
      alert("Please fill in all required fields (rsid and gene are required).");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/risk`, { formData });
      const data = response.data;

      const risk = data.predicted_risk_level || "Unknown";
      const confidence = data.confidence || "N/A";
      const probabilities =
        data.probabilities ||
        data.risk_probabilities ||
        data.riskProbabilities ||
        {};

      let color = "text-yellow-400";
      if (risk.includes("Low")) color = "text-green-400";
      if (risk.includes("High")) color = "text-red-400";

      const interpretations = {
        "Very Low Risk":
          "- Minimal clinical significance\n- Standard monitoring recommended\n- No immediate intervention required",
        "Low Risk":
          "- Slightly elevated genetic indicators\n- Periodic monitoring advised\n- Lifestyle management may be sufficient",
        "Moderate Risk":
          "- Noticeable genetic susceptibility\n- Early clinical evaluation recommended\n- Personalized monitoring may be required",
        "High Risk":
          "- Strong genetic predisposition detected\n- Immediate consultation recommended\n- Preventive action may be needed",
        "Very High Risk":
          "- Critical genetic risk factors identified\n- Urgent medical intervention advised\n- Continuous clinical supervision required",
      };

      setResult({
        classification: { label: risk, color },
        confidence,
        interpretation:
          interpretations[risk] || "No clinical interpretation available.",
        probabilities,
      });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.msg ||
        "Error connecting to ML prediction service.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0026] text-white px-4">
      <div className="glass p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Risk Stratification</h2>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {Object.keys(formData).map((field, i) => (
              <input
                key={i}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={
                  field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase()) + "..."
                }
                className="w-full bg-[#24004d] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ))}

            <button
              className="w-full bg-purple-600 py-3 rounded hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Submit"}
            </button>
          </form>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="loader border-4 border-purple-400 border-t-transparent w-12 h-12 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-purple-300">Analyzing genomic data...</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="text-center">
              <p className={`text-xl font-bold ${result.classification.color}`}>
                PREDICTED RISK LEVEL: {result.classification.label}
              </p>
              <p className="text-purple-300 font-medium mt-1">
                Confidence: {result.confidence}
              </p>
            </div>

            <div className="bg-[#24004d] p-5 rounded border border-white/10">
              <p className="font-semibold text-purple-300 mb-3">
                Detailed Risk Probabilities:
              </p>
              <div className="space-y-2 text-sm">
                {Object.entries(result.probabilities).map(([key, value], i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-white"
                  >
                    <span>{key}</span>
                    <span>{(value * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#24004d] p-5 rounded border border-white/10 whitespace-pre-line">
              <p className="font-semibold text-purple-300 mb-2">
                CLINICAL INTERPRETATION
              </p>
              <p className="text-white leading-relaxed">{result.interpretation}</p>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full bg-purple-500 py-2 rounded hover:bg-purple-600 transition"
            >
              Analyze Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
