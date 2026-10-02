'use client';

import React, { useEffect, forwardRef } from 'react';
import NextLink from 'next/link';
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

/**
 * Universal Link component that accepts both `to` (React Router) and `href` (Next.js)
 */
export const Link = forwardRef(function Link(
  { to, href, children, className, onClick, ...rest },
  ref
) {
  const destination = href || to || '/';
  const finalHref = typeof destination === 'object'
    ? `${destination.pathname || ''}${destination.search ? '?' + destination.search : ''}`
    : destination;

  return (
    <NextLink
      ref={ref}
      href={finalHref}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </NextLink>
  );
});

export const NavLink = forwardRef(function NavLink(
  { to, href, className, children, ...rest },
  ref
) {
  const pathname = usePathname();
  const destination = href || to || '/';
  const isActive = pathname === destination;

  const resolvedClassName =
    typeof className === 'function'
      ? className({ isActive, isPending: false })
      : className;

  return (
    <Link
      ref={ref}
      href={destination}
      className={resolvedClassName}
      {...rest}
    >
      {children}
    </Link>
  );
});

/**
 * React Router style useNavigate hook powered by Next.js useRouter
 */
export const useNavigate = () => {
  const router = useRouter();

  return (target, options = {}) => {
    if (typeof target === 'number') {
      if (target === -1) router.back();
      else if (target === 1) router.forward();
      return;
    }
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };
};

/**
 * React Router style useLocation hook powered by Next.js usePathname & useSearchParams
 */
export const useLocation = () => {
  const pathname = usePathname() || '/';
  let search = '';
  try {
    const searchParams = useNextSearchParams();
    search = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '';
  } catch (e) {
    // In SSR or outside Suspense, fallback safely
  }

  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: 'default',
  };
};

/**
 * React Router style useParams hook powered by Next.js useParams
 */
export const useParams = () => {
  try {
    return useNextParams() || {};
  } catch (e) {
    return {};
  }
};

/**
 * React Router style useSearchParams hook
 */
export const useSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useNextSearchParams();

  const setSearchParams = (newParams) => {
    const nextSearchParams = new URLSearchParams(params?.toString() || '');
    if (newParams instanceof URLSearchParams) {
      router.push(`${pathname}?${newParams.toString()}`);
    } else if (typeof newParams === 'object') {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === null || v === undefined) {
          nextSearchParams.delete(k);
        } else {
          nextSearchParams.set(k, String(v));
        }
      });
      router.push(`${pathname}?${nextSearchParams.toString()}`);
    }
  };

  return [params, setSearchParams];
};

/**
 * React Router style Navigate component
 */
export const Navigate = ({ to, replace = false }) => {
  const router = useRouter();

  useEffect(() => {
    if (to) {
      if (replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  }, [to, replace, router]);

  return null;
};

/**
 * Outlet placeholder for nested layouts
 */
export const Outlet = ({ children }) => children || null;

export default {
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Outlet,
};
