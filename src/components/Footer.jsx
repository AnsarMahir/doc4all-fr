import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Doc4All</h3>
            <p className="text-gray-600 mb-4">
              Connecting patients with healthcare professionals and dispensaries for better healthcare access.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Services</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Contact</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">HIPAA Compliance</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-600">
              <p>123 Kahatowita</p>
              <p>Nittambuwa, WP 11144</p>
              <p className="mt-2">Email: info@Doc4All.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Doc4All. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer