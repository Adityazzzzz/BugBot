'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { Code2, HelpCircle, ShieldAlert, ChevronDown, Check, User, Sparkles } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { users, activeUser, switchUser, loading } = useUser();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLinkActive = (path) => {
    return pathname === path ? styles.active : '';
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Abstract Cybernetic Logo */}
        <Link href="/" className={styles.brand}>
          <svg className={styles.logoSvg} viewBox="0 0 100 100" width="32" height="32">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <polygon 
              points="50,15 80,32 80,68 50,85 20,68 20,32" 
              fill="none" 
              stroke="url(#logoGrad)" 
              strokeWidth="6" 
            />
            <polygon 
              points="50,28 70,40 70,60 50,72 30,60 30,40" 
              fill="none" 
              stroke="url(#logoGrad)" 
              strokeWidth="2" 
              strokeDasharray="4 2"
            />
            <circle cx="50" cy="50" r="10" fill="url(#logoGrad)" />
          </svg>
          <div className={styles.brandText}>
            <span className={styles.brandGrad}>BugBot</span>
            <span className={styles.brandSub}>Portal</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <ul className={styles.navLinks}>
          <li>
            <Link href="/" className={isLinkActive('/')}>
              <Code2 size={16} />
              Challenges
            </Link>
          </li>
          <li>
            <Link href="/doubt" className={isLinkActive('/doubt')}>
              <HelpCircle size={16} />
              Doubt Board
            </Link>
          </li>
          {activeUser?.role === 'TEACHER' && (
            <li>
              <Link href="/teacher" className={isLinkActive('/teacher')}>
                <ShieldAlert size={16} />
                Moderation Panel
              </Link>
            </li>
          )}
        </ul>

        {/* Custom Profile Switcher Dropdown */}
        <div className={styles.userSection} ref={dropdownRef}>
          {loading ? (
            <span className={styles.loader}></span>
          ) : (
            <div className={styles.profileTriggerWrapper}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className={styles.profileCardBtn}
              >
                <div className={`${styles.avatar} ${activeUser?.role === 'TEACHER' ? styles.avatarTeacher : styles.avatarStudent}`}>
                  {activeUser?.role === 'STUDENT' ? 'AS' : 'SA'}
                </div>
                
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>
                    {activeUser?.role === 'STUDENT' ? 'Aditya Singh' : 'Sarah (Instructor)'}
                  </span>
                  <span className={styles.profileRole}>
                    {activeUser?.role === 'STUDENT' ? 'ID: 23U03031 | Student' : 'Course Moderation'}
                  </span>
                </div>
                <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ''}`} />
              </button>

              {/* Dropdown Card */}
              {dropdownOpen && (
                <div className={styles.dropdownCard}>
                  <div className={styles.dropdownHeader}>
                    <span>Select Profile</span>
                  </div>
                  <ul className={styles.userList}>
                    {users.map((u) => {
                      const isSelected = activeUser?.id === u.id;
                      
                      const displayName = u.role === 'STUDENT' ? 'Aditya Singh' : 'Sarah (Instructor)';
                      const displayInitials = u.role === 'STUDENT' ? 'AS' : 'SA';
                      const displayRole = u.role === 'TEACHER' ? 'Course Instructor' : 'ID: 23U03031 | Learner';

                      return (
                        <li key={u.id}>
                          <button 
                            className={`${styles.userOptionBtn} ${isSelected ? styles.userSelected : ''}`}
                            onClick={() => {
                              switchUser(u.id);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className={`${styles.avatar} ${u.role === 'TEACHER' ? styles.avatarTeacher : styles.avatarStudent}`}>
                              {displayInitials}
                            </div>
                            <div className={styles.optionMeta}>
                              <span className={styles.optionName}>{displayName}</span>
                              <span className={styles.optionRole}>{displayRole}</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
