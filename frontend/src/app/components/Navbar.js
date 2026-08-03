'use client';

/**
 * Navbar.js
 * Implements a sticky, glassmorphic header displaying navigation links
 * and a client-side dropdown selector allowing users to switch mock roles.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { Code2, HelpCircle, ShieldAlert, User, CheckCircle } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { users, activeUser, switchUser, loading } = useUser();
  const pathname = usePathname();

  const isLinkActive = (path) => {
    return pathname === path ? styles.active : '';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brand}>
          <span className={styles.brandGrad}>BugBot</span>
          <span className={styles.brandSub}>Portal</span>
        </Link>

        {/* Navigation Items */}
        <ul className={styles.navLinks}>
          <li>
            <Link href="/" className={isLinkActive('/')}>
              <Code2 size={18} />
              Problems
            </Link>
          </li>
          <li>
            <Link href="/doubt" className={isLinkActive('/doubt')}>
              <HelpCircle size={18} />
              Doubt Board
            </Link>
          </li>
          {activeUser?.role === 'TEACHER' && (
            <li>
              <Link href="/teacher" className={isLinkActive('/teacher')}>
                <ShieldAlert size={18} />
                Teacher Portal
              </Link>
            </li>
          )}
        </ul>

        {/* Role Switcher Selector */}
        <div className={styles.userSection}>
          {loading ? (
            <span className={styles.loader}></span>
          ) : (
            <div className={styles.selectorWrapper}>
              <User size={16} className={styles.userIcon} />
              <select 
                value={activeUser?.id || ''} 
                onChange={(e) => switchUser(e.target.value)}
                className={styles.userSelector}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role === 'TEACHER' ? 'Teacher' : 'Student'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
