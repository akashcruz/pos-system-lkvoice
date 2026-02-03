import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/pos', label: 'POS', icon: <ShoppingCart size={20} /> },
        { path: '/inventory', label: 'Inventory', icon: <Package size={20} /> },
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-around md:justify-start md:space-x-8 h-16 items-center">
                    <div className="hidden md:block font-bold text-xl text-primary mr-8">
                        Retail POS
                    </div>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col md:flex-row items-center p-2 rounded-lg transition-colors ${isActive(item.path)
                                    ? 'text-primary bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {item.icon}
                            <span className="text-xs md:text-sm md:ml-2 mt-1 md:mt-0 font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
