import { FaLeaf, FaYinYang, FaHospital, FaMoon } from 'react-icons/fa'

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
      icon: <FaMoon className="text-purple-600 text-5xl mb-4" />,
      title: "Unani Medicine",
      description: "Access Unani practitioners who use traditional Greco-Arabic medicine principles, focusing on natural healing through herbal medicines, diet therapy, and lifestyle modifications.",
      benefits: ["Time-tested remedies", "Natural detoxification", "Constitutional treatment", "Preventive healthcare"]
    },
    {
      icon: <FaHospital className="text-red-600 text-5xl mb-4" />,
      title: "Western Medicine",
      description: "Access conventional medical practitioners trained in evidence-based approaches using modern diagnostic tools, pharmaceuticals, and surgical interventions.",
      benefits: ["Advanced diagnostics", "Emergency care", "Surgical options", "Pharmaceutical treatments"]
    }
  ]

  return (
    <section className="relative py-16 bg-gradient-to-bl from-white via-primary-50 to-primary-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">Treatment Disciplines</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Doc4All brings together multiple healthcare disciplines, allowing you to choose the approach that best suits your needs and beliefs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {disciplines.map((discipline, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-t-4 border-primary-500">
              <div className="text-center">
                {discipline.icon}
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">{discipline.title}</h3>
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