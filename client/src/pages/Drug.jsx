import { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/ml";

const DRUG_COLORS = {
  Effective: "text-green-400",
  Resistant: "text-yellow-400",
  Toxic: "text-red-400",
};

export default function Drug() {
  const [formData, setFormData] = useState({
    drug: "",
    gene: "",
    allele: "",
    comparisonAllele: "",
    metabolizer: "",
    comparisonMetabolizer: "",
    disease: "",
    populationType: "",
    direction: "",
    rsid: "",
    pkTerm: "",
    isAssociated: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.drug || !formData.gene) {
      alert("Please fill in all required fields (drug and gene).");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/drug`, { formData });
      const data = response.data;

      const classification = data.classification || "Resistant";
      const color = DRUG_COLORS[classification] || "text-yellow-400";

      setResult({
        classification: { label: classification, color },
        description:
          data.description ||
          "Genetic variation suggests a measurable impact on drug response.",
        confidence: data.confidence || "N/A",
        why: data.why || "Derived from model-inferred gene-drug relationships.",
        responseProbabilities:
          data.response_probabilities || data.responseProbabilities || {},
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
        <h2 className="text-2xl font-bold mb-6 text-center">Drug Response</h2>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
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
            ].map((field, i) => (
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
            <p className="text-lg text-purple-300">Analyzing pharmacogenomic data...</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <p
              className={`text-xl font-bold text-center ${result.classification.color}`}
            >
              The Drug is: {result.classification.label}
            </p>

            <p className="text-gp_muted text-center">{result.description}</p>

            <div className="bg-[#24004d] p-4 rounded border border-white/10">
              <p className="font-semibold">
                Confidence Score: <span className="text-white">{result.confidence}</span>
              </p>
            </div>

            {Object.keys(result.responseProbabilities).length > 0 && (
              <div className="bg-[#24004d] p-4 rounded border border-white/10">
                <p className="font-semibold mb-2">Response Probabilities</p>
                <div className="space-y-2 text-sm">
                  {Object.entries(result.responseProbabilities).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span>{(value * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#24004d] p-4 rounded border border-white/10">
              <p className="font-semibold">Why?</p>
              <p className="text-gp_muted mt-2">{result.why}</p>
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
