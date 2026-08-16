"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await emailjs.send(
        "service_2z2imqp", // EmailJS Service ID
        "template_09fvxyn", // EmailJS Template ID
        { name, email, message }, // template parameters
        "7ieLAwg5IFgkJqt-M" // EmailJS Public Key
      );

      console.log(result);
      toast.success("Message sent!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Contact Us</h1>

      <p className="text-black-300 mb-4">
        Have a question or want to collaborate? Fill out the form below or email
        us directly at{" "}
        <a
          href="mailto:tamajitsaha05@gmail.com"
          className="text-purple-600 underline"
        >
          mayukhg78@gmail.com
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Social links */}
      <div className="mt-8 text-black-300">
        <h2 className="text-xl font-semibold mb-2">Follow us:</h2>
        <div className="flex gap-4">
          <a
            href="https://x.com/tamajitsaha05"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://github.com/Tamajit-005"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://www.instagram.com/tamajit005/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition"
          >
            <FaInstagram size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
