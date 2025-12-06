'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Create Convoy', path: '/create' },
        { name: 'Threat Analysis', path: '/threats' },
        { name: 'Emergencies', path: '/emergencies' },
        { name: 'Priority Engine', path: '/priority' },
        { name: 'Conflicts', path: '/conflicts' },
        { name: 'Digital Twin', path: '/digital-twin' },
        { name: 'Driver Portal', path: '/driver' },
    ];

    return (
        <nav className="nav">
            <div className="nav-container">
                <div className="nav-logo">
                    <h1>🛡️ AstraConvoy</h1>
                    <span className="nav-badge">AI DEFENCE</span>
                </div>
                <ul className="nav-links">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                className={pathname === item.path ? 'active' : ''}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
