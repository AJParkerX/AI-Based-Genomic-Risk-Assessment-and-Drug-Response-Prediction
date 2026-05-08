import { useState } from "react";
import person1 from "../assets/person1.jpg";
import person2 from "../assets/person2.jpg";
import person3 from "../assets/person3.jpg";
import person4 from "../assets/person4.jpg";

export default function About() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is Helix23?",
      a: "Helix23 is an AI-powered genomic analysis platform designed to assess disease risks and drug responses from DNA data.",
    },
    {
      q: "How secure is my data?",
      a: "Your data is encrypted and handled with strict privacy standards. We never share your genomic data with third parties.",
    },
    {
      q: "Who can use Helix23?",
      a: "Our platform is designed for both healthcare professionals and individuals who want to understand their genetic risks.",
    },
    {
      q: "How accurate are the predictions?",
      a: "Our models are trained on validated datasets, but results should be interpreted alongside professional medical advice. Currently, the system does not process data involving the Y chromosome",
    },
    {
      q: "Can I export my results?",
      a: "Yes, Helix23 allows exporting results in PDF and CSV format for your personal use or to share with your doctor.",
    },
  ];

  // ✅ Developers data with names + images
  const developers = [
    { name: "Jawad Parkar", img: person1 },
    { name: "Vinayak Satishan", img: person2 },
    { name: "Aryan Oak", img: person3 },
    { name: "Atharva Kalokhe", img: person4 },
  ];

  return (
    <div className="min-h-screen bg-[#0e0026] text-white px-6 md:px-12 py-16">
      {/* Section 1: What is Helix23 */}
      <section className="max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-4xl font-bold mb-6">What is Helix23?</h1>
        <p className="text-lg text-gp_muted">
          Helix23 is a next-generation AI platform designed for genomic analysis, integrating genetic data to assess disease risk and predict individual responses to drugs. It leverages machine learning models to stratify patients based on their genomic profiles, enhancing personalized medicine. By identifying genetic biomarkers, Helix23 aims to optimize treatment strategies and improve clinical outcomes.
        </p>
      </section>

      {/* Section 2: Vision */}
      <section className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-3xl font-semibold mb-4">Vision of Helix23</h2>
        <p className="text-lg text-gp_muted">
          The vision of Helix23 is to revolutionize healthcare through precision medicine by harnessing AI and genomics. It aims to enable early disease prediction, personalized treatment, and optimized drug response for every individual. Helix23 envisions a future where data-driven insights transform patient care and clinical decision-making.
        </p>
      </section>

      {/* Section 3: Model Developers */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-center mb-10">
           Model Developed By
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {developers.map((dev, i) => (
            <div
              key={i}
              className="glass p-6 rounded-xl hover:scale-105 transition"
            >
              <img
                src={dev.img}
                alt={dev.name}
                className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-2 border-purple-500"
              />
              <p className="font-semibold">{dev.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: FAQs */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-center mb-10">❓ FAQs</h2>
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={index} className="glass rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-4 font-medium flex justify-between items-center"
              >
                {item.q}
                <span>{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gp_muted">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
