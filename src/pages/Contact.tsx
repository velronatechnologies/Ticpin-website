import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log("Form submitted:", formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
            <div className="relative z-10">
                <Navbar />

                <main>
                    {/* Hero Section */}
                    <section className="relative min-h-[40vh] flex items-center pt-20 overflow-hidden">
                        <div className="container mx-auto px-4 lg:px-8 relative z-10">
                            <div className="max-w-4xl mx-auto text-center">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
                                    Get In <span style={{ color: '#5331ea' }}>Touch</span>
                                </h1>
                                <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto">
                                    Have questions or feedback? We'd love to hear from you. Reach out to us and we'll get back to you as soon as possible.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="py-16 lg:py-24">
                        <div className="container mx-auto px-4 lg:px-8">
                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
                                {/* Contact Form */}
                                <div className="order-2 lg:order-1">
                                    <h2 className="text-3xl font-extrabold mb-6" style={{ color: '#000000' }}>Send us a message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none transition-all text-gray-900"
                                                style={{ border: '2px solid #000000' }}
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none transition-all text-gray-900"
                                                style={{ border: '2px solid #000000' }}
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none transition-all text-gray-900"
                                                style={{ border: '2px solid #000000' }}
                                                placeholder="How can we help?"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none transition-all resize-none text-gray-900"
                                                style={{ border: '2px solid #000000' }}
                                                placeholder="Tell us more..."
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="transition-all duration-300 rounded-full px-8 h-14 text-base gap-2 shadow-lg w-full sm:w-auto text-white"
                                            style={{ backgroundColor: '#5331ea' }}
                                        >
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </Button>
                                    </form>
                                </div>

                                {/* Contact Info */}
                                <div className="order-1 lg:order-2">
                                    <h2 className="text-3xl font-extrabold mb-6" style={{ color: '#000000' }}>Contact Information</h2>
                                    <p className="text-gray-700 mb-8">
                                        Feel free to reach out through any of these channels. We're here to help!
                                    </p>

                                    <div className="space-y-6">
                                        {/* Email */}
                                        <div className="flex items-start gap-4 p-6 bg-white rounded-2xl transition-all shadow-sm" style={{ border: '2px solid #000000' }}>
                                            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(83, 49, 234, 0.2)' }}>
                                                <Mail className="w-6 h-6" style={{ color: '#5331ea' }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1" style={{ color: '#000000' }}>Email</h3>
                                                <a href="mailto:ticpin.inc@gmail.com" className="text-gray-700 transition-colors" style={{ textDecoration: 'none' }}>
                                                    ticpin.inc@gmail.com
                                                </a>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-4 p-6 bg-white rounded-2xl transition-all shadow-sm" style={{ border: '2px solid #000000' }}>
                                            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(83, 49, 234, 0.2)' }}>
                                                <Phone className="w-6 h-6" style={{ color: '#5331ea' }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1" style={{ color: '#000000' }}>Phone</h3>
                                                <a href="tel:+917550030564" className="text-gray-700 transition-colors" style={{ textDecoration: 'none' }}>
                                                    +91 75500 30564
                                                </a>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        {/* <div className="flex items-start gap-4 p-6 bg-white rounded-2xl transition-all shadow-sm" style={{ border: '2px solid #000000' }}>
                                            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(83, 49, 234, 0.2)' }}>
                                                <MapPin className="w-6 h-6" style={{ color: '#5331ea' }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1" style={{ color: '#000000' }}>Address</h3>
                                                <p className="text-gray-700">
                                                    123 TICPIN Street<br />
                                                    City, State 12345
                                                </p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default Contact;
