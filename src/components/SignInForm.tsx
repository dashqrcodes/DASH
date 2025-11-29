import React, { useState } from 'react';
import { useRouter } from 'next/router';

const SignInForm: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Phone Number:', phoneNumber);
        console.log('Password:', password);
        router.push('/account');
    };

    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <div className="mobile-section">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', color: '#ffffff', padding: '12px 15px', fontSize: '16px', height: '50px' }}
                />
            </div>
            <div className="form-section">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', color: '#ffffff', padding: '12px 15px', fontSize: '16px', height: '50px' }}
                />
            </div>
            <div className="action-section">
                <button type="submit" className="signup-button">Sign In</button>
            </div>
        </form>
    );
};

export default SignInForm;