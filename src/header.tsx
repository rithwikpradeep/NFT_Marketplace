import React from 'react';
import './header.css';

const Header: React.FC = () => {
    return (
        <header className="header-container">
            <a href="/Home">
                <img src="/Satofin full frame - enhanced.png" alt="Satofin" className="header-logo" />
            </a>
            <nav className="header-nav">
                <a href="/Home" className="nav-link">Home</a>
                <a href="/Trading" className="nav-link">Trading</a>
                <a href="/MarketPlace" className="nav-link">MarketPlace</a>
                <a href="/Voting" className="nav-link">Voting</a>
                <a href="/Education" className="nav-link">Education</a>
                <a href="/FAQs" className="nav-link">FAQs</a>
                <a href="/contact" className="nav-link">Contact Us</a>
            </nav>
        </header>
    );
};

export default Header;
