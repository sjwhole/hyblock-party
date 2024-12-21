// src/pages/Home.jsx

import Image from "next/image";
import React from "react";
import { FaInstagram } from "react-icons/fa"; // Optional: For Instagram icon

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="bg-gray-800 text-white shadow">
        <div className="container mx-auto flex justify-between items-center p-4">
          {/* Logo and Club Name */}
          <div className="flex items-center">
            <span className="text-xl font-bold">HYBLOCK</span>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#home" className="hover:text-gray-400">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-gray-400">
                  About
                </a>
              </li>
              <li>
                <a href="#social" className="hover:text-gray-400">
                  Social
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-gray-400">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="flex flex-col justify-center items-center mb-5 "
      >
        <Image src="/1500x500.jpeg" width={1200} height={300} alt="HYBLOCK" />
        <p className="text-xl text-black font-bold mb-8">
          🔗 Beyond the Chain, Higher Block
        </p>
        <a
          href="#contact"
          className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-3 rounded-full text-lg font-semibold"
        >
          Join Us
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">About HYBLOCK</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            🖲 한양대학교 블록체인 학회 하이블록입니다. HYBLOCK is a blockchain
            club at Hanyang University dedicated to exploring the endless
            possibilities of blockchain technology. We organize workshops,
            seminars, and collaborative projects to foster innovation and
            practical skills in the blockchain space.
          </p>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Follow Us on Instagram</h2>
          <div className="flex flex-col items-center space-y-2 mb-4">
            <p className="text-xl font-semibold">@hyblock_kr</p>
          </div>
          <a
            href="https://instagram.com/hyblock_kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 justify-center text-blue-600 hover:text-blue-800"
          >
            <FaInstagram size={24} />
            <span>instagram.com/hyblock_kr/</span>
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="text-lg text-gray-700">
            💁🏻‍♂️ Email:{" "}
            <a
              href="mailto:hyblock2022@gmail.com"
              className="text-blue-500 hover:underline"
            >
              hyblock2022@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} HYBLOCK. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
