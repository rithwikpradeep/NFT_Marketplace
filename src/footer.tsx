import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
    return (
        <div className="footer-container">
            <div className="footer-logo-section">
             <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
        <img src="/Satofin full frame - enhanced.png" alt="Satofin Logo" className="footer-logo" />
    </a>
</div>
            <div className="footer-links-section">
                <a href="/privacy-policy.html" className="footer-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <a href="/aml.html" className="footer-link" target="_blank" rel="noopener noreferrer">AML</a>
                <a href="/terms-and-conditions.html" className="footer-link" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                <a href="/tradingpolicy.html" className="footer-link" target="_blank" rel="noopener noreferrer">Trading Policy</a>
            </div>
            <div className="footer-copyright-section">
                <p>&copy; 2023 Satofin. All rights reserved.</p>
            </div>
        </div>
    );
}

export default Footer;