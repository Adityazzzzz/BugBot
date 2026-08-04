'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { Code2, HelpCircle, ShieldAlert, ChevronDown, Check } from 'lucide-react';
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
        {/* Sleek Modern Logo */}
        <Link href="/" className={styles.brand}>
          <img src="/logo.jpg" alt="BugBot Logo" className={styles.brandLogoImg} />
          <div className={styles.brandText}>
            <span className={styles.brandGrad}>BugBot</span>
            <span className={styles.brandSub}>AI Sandbox</span>
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
                    {activeUser?.role === 'STUDENT' ? 'ID: 23U03031' : 'Moderator'}
                  </span>
                </div>
                <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ''}`} />
              </button>

              {/* Dropdown Card */}
              {dropdownOpen && (
                <div className={styles.dropdownCard}>
                  <div className={styles.dropdownHeader}>
                    <span>Switch Active Profile</span>
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
                            {isSelected && <Check size={14} className={styles.checkIcon} />}
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