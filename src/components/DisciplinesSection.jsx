import { FaLeaf, FaYinYang, FaHospital } from 'react-icons/fa'

const DisciplinesSection = () => {
  const disciplines = [
    {
      icon: <FaLeaf className="text-green-600 text-5xl mb-4" />,
      title: "Ayurvedic Medicine",
      description: "Connect with Ayurvedic practitioners who focus on holistic healing through natural remedies, diet, and lifestyle changes based on ancient Indian medical practices.",
      benefits: ["Natural healing processes", "Personalized treatment plans", "Focus on prevention", "Holistic approach"]
    },
    {
      icon: <FaYinYang className="text-blue-600 text-5xl mb-4" />,
      title: "Homeopathic Treatment",
      description: "Find homeopathic doctors who treat conditions using highly diluted natural substances that trigger the body's natural healing system.",
      benefits: ["Non-invasive treatments", "Minimal side effects", "Treats root causes", "Personalized remedies"]
    },
    {
      icon: <FaHospital className="text-red-600 text-5xl mb-4" />,
      title: "Western Medicine",
      description: "Access conventional medical practitioners trained in evidence-based approaches using modern diagnostic tools, pharmaceuticals, and surgical interventions.",
      benefits: ["Advanced diagnostics", "Emergency care", "Surgical options", "Pharmaceutical treatments"]
    }
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Treatment Disciplines</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Doc4All brings together multiple healthcare disciplines, allowing you to choose the approach that best suits your needs and beliefs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {disciplines.map((discipline, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-primary-500">
              <div className="text-center">
                {discipline.icon}
                <h3 className="text-2xl font-semibold mb-3">{discipline.title}</h3>
                <p className="text-gray-600 mb-4">{discipline.description}</p>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Key Benefits:</h4>
                  <ul className="text-left text-gray-600 pl-5 space-y-1">
                    {discipline.benefits.map((benefit, idx) => (
                      <li key={idx} className="list-disc">{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DisciplinesSection