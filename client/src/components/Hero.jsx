import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ use custom hook
import DNA from "./DNA";

export default function Hero() {
  const [showOptions, setShowOptions] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (user) {
      navigate(path);
    } else {
      alert("⚠️ Please login first to access this analysis.");
      navigate("/login");
    }
  };

  const handlePlanSelect = (plan) => {
    // Close pricing board first
    setShowPricing(false);

    if (plan === "free") {
      // For free plan, open the same analysis options overlay (preserves existing behavior)
      setShowOptions(true);
    } else {
      // For paid plans, go to subscribe/checkout route (user will be prompted to login by handleNavigate)
      handleNavigate(`/subscribe?plan=${plan}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="hero-dots" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
        {/* remove blur entirely; make hero non-interactive when pricing is open */}
        <div
          className={`glass rounded-3xl p-8 md:p-12 relative transition-all ${
            showPricing ? "pointer-events-none" : ""
          }`}
        >
          {/* content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Personalized Genomic <br />
                Risk Assessment
              </h1>
              <p className="mt-5 text-lg text-gp_muted max-w-xl">
                Advanced AI-powered analysis of your DNA for disease risk and
                drug response prediction.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="btn-primary px-8 py-3 bg-purple-600 rounded-lg text-lg font-medium hover:bg-purple-700 transition"
                >
                  Start Your Analysis
                </button>
                <button onClick={() => setShowPricing(true)} className="btn-ghost">
                  Learn more
                </button>
              </div>

              <div className="mt-8 rounded-xl2 bg-gp_panel/60 p-5 border border-white/5">
                <p className="text-xl font-semibold">Unlock Insights into Your Health</p>
                <p className="text-gp_muted mt-2">
                  Gain a deeper understanding of your genetic predispositions and
                  health risks.
                </p>
              </div>
            </div>

            {/* DNA canvas */}
            <div className="h-[380px] md:h-[480px] lg:h-[520px] relative">
              <Suspense fallback={<div className="w-full h-full rounded-3xl bg-gp_panelSoft" />}>
                <DNA />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ✅ Overlay card for analysis options (unchanged) */}
        {showOptions && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
            <div className="glass p-8 rounded-xl w-80 text-center relative">
              <button
                onClick={() => setShowOptions(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold mb-6">Choose Analysis Type</h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleNavigate("/risk")}
                  className="btn-primary bg-purple-600 py-3 rounded hover:bg-purple-700 transition"
                >
                  🧬 Risk Stratification
                </button>
                <button
                  onClick={() => handleNavigate("/drug")}
                  className="btn-primary bg-purple-500 py-3 rounded hover:bg-purple-600 transition"
                >
                  💊 Drug Response
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing board overlay (NO BLUR — FULL BLACK BACKDROP, OPAQUE CARD ABOVE) */}
        {showPricing && (
          <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-10" aria-hidden={!showPricing}>
            {/* full black backdrop that covers everything */}
            <div
  className="absolute inset-0"
  style={{ backgroundColor: "#333333", zIndex: 9998 }}
  onClick={() => setShowPricing(false)}
/>


            {/* pricing card container sits above the black backdrop */}
            <div
              className="relative z-[9999] w-full max-w-6xl px-6 pointer-events-auto"
              aria-modal="true"
              role="dialog"
            >
              <div
                className="rounded-2xl p-6 md:p-8 shadow-xl transform transition-transform duration-300 translate-y-0 text-white"
                style={{ backgroundColor: "rgba(0,0,0,0.95)", zIndex: 9999 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Pricing</h2>
                    <p className="text-gp_muted mt-1">
                      Choose a plan that fits your needs — from free analysis to
                      full clinical integrations.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPricing(false)}
                    className="text-gray-300 hover:text-white"
                    aria-label="Close pricing"
                  >
                    ✕
                  </button>
                </div>

                {/* Plans */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free */}
                  <div className="border border-white/10 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Free</h3>
                      <span className="text-sm text-gp_muted">Always</span>
                    </div>
                    <p className="mt-3 text-lg font-bold">₹0</p>

                    <ul className="mt-4 space-y-2 text-sm text-gp_muted flex-1">
                      <li>• Drug Response Prediction</li>
                      <li>• Risk Stratification</li>
                      <li>• Confidence Scores</li>
                    </ul>

                    <div className="mt-4">
                      <button
                        onClick={() => handlePlanSelect("free")}
                        className="w-full btn-primary bg-white/5 py-2 rounded hover:bg-white/10 transition"
                      >
                        Try Free
                      </button>
                    </div>
                  </div>

                  {/* Moderate */}
                  <div className="border border-white/10 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Moderate</h3>
                      <span className="text-sm text-gp_muted">Most popular</span>
                    </div>
                    <p className="mt-3 text-lg font-bold">₹399</p>

                    <ul className="mt-4 space-y-2 text-sm text-gp_muted flex-1">
                      <li>• Export CSV & PDF of Predicted Output</li>
                      <li>• Comprehensive Drug Response & Risk Stratification</li>
                      <li>• Confidence Scores</li>
                      <li>• Customizable Risk Profiles</li>
                      <li>• Basic Data Visualization (Charts / Graphs)</li>
                      <li>• Basic Access to Genetic Insights</li>
                      <li>• Monthly Report — Summary of Patient Data</li>
                      <li>• Email Support & Consultation</li>
                    </ul>

                    <div className="mt-4">
                      <button
                        onClick={() => handlePlanSelect("moderate")}
                        className="w-full btn-primary bg-purple-600 py-2 rounded hover:bg-purple-700 transition"
                      >
                        Purchase ₹399
                      </button>
                    </div>
                  </div>

                  {/* Advanced */}
                  <div className="border border-white/10 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Advanced</h3>
                      <span className="text-sm text-gp_muted">For clinics</span>
                    </div>
                    <p className="mt-3 text-lg font-bold">₹929</p>

                    <ul className="mt-4 space-y-2 text-sm text-gp_muted flex-1">
                      <li>• Everything in Moderate</li>
                      <li>• Hospital Alerts (Real-time notifications)</li>
                      <li>• Prior Online Direct Doctor Consultation</li>
                      <li>• Advanced Data Analytics & granular insights</li>
                      <li>• Genomic Data Interpretation with Actionable Insights</li>
                      <li>• Real-time Genetic Counseling Integration</li>
                      <li>• Priority Customer Support (24/7)</li>
                      <li>• Personalized Treatment Recommendations</li>
                      <li>• Integration with Hospital / Clinical Databases (EHR/EMR)</li>
                      <li>• API Access for Third-party Integration</li>
                      <li>• Quarterly In-depth Reports & Predictive Modeling Trends</li>
                    </ul>

                    <div className="mt-4">
                      <button
                        onClick={() => handlePlanSelect("advanced")}
                        className="w-full btn-primary bg-orange-500 py-2 rounded hover:bg-orange-600 transition"
                      >
                        Purchase ₹929
                      </button>
                    </div>
                  </div>
                </div>

                {/* small note */}
                <p className="mt-5 text-sm text-gp_muted">
                  Need a custom/institutional integration? Contact sales for
                  hospital or research pricing and API access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
