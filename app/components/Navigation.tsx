'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        localStorage.clear(); // Complete wipe of all tactical data
        setUserRole(null);
        window.location.href = '/login'; // Force full refresh to clear React states
    };

    return (
        <nav className="nav">
            <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    {/* Brand/Logo could go here if needed */}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Link href="/" style={{ 
                        textDecoration: 'none', 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold', 
                        color: 'var(--military-gold)',
                        letterSpacing: '2px'
                    }}>
                        🏠 HOME
                    </Link>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {userRole && userRole !== 'null' ? (
                        <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                            🚪 LOGOUT
                        </button>
                    ) : (
                        <Link href="/login">
                            <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                                🔑 LOGIN
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
